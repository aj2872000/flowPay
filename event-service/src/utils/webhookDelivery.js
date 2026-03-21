const axios    = require("axios");
const crypto   = require("crypto");
const Delivery = require("../models/delivery.model");
const Webhook  = require("../models/webhook.model");
const Event    = require("../models/event.model");
const config   = require("../config");
const logger   = require("./logger");

// ── Exponential back-off: attempt 1→30s, 2→60s, 3→300s, 4→1800s, 5→3600s
const backoffSeconds = (attempt) => {
  const delays = [30, 60, 300, 1800, 3600];
  return (delays[attempt - 1] || 3600) * 1000;
};

/**
 * Build the HMAC-SHA256 signature header so receivers can verify authenticity.
 * Format: "t=<timestamp>,v1=<hex-signature>"
 */
const buildSignature = (secret, timestamp, body) => {
  const payload = `${timestamp}.${JSON.stringify(body)}`;
  const sig     = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return `t=${timestamp},v1=${sig}`;
};

/**
 * Deliver a single event to a single webhook endpoint.
 * Creates/updates a Delivery document and updates Webhook stats.
 */
const deliverToWebhook = async (event, webhook, attempt = 1) => {
  const start     = Date.now();
  const timestamp = Math.floor(start / 1000);

  // Fetch the secret (excluded by default)
  const webhookWithSecret = await Webhook.findById(webhook._id).select("+secret");
  const secret = webhookWithSecret?.secret || "";

  const body = {
    id:        `evt_${event._id}`,
    type:      event.type,
    service:   event.service,
    payload:   event.payload,
    createdAt: event.createdAt,
  };

  // Find or create a delivery document for this event+webhook pair
  let delivery = await Delivery.findOne({ eventId: event._id, webhookId: webhook._id });
  if (!delivery) {
    delivery = new Delivery({
      eventId:   event._id,
      webhookId: webhook._id,
      url:       webhook.url,
      attempt,
    });
  } else {
    delivery.attempt = attempt;
  }

  try {
    const response = await axios.post(webhook.url, body, {
      timeout: config.webhook.timeoutMs,
      headers: {
        "Content-Type":    "application/json",
        "X-FlowPay-Event": event.type,
        "X-FlowPay-Signature": buildSignature(secret, timestamp, body),
        "User-Agent":      "FlowPay-Webhooks/1.0",
      },
    });

    const responseTimeMs = Date.now() - start;

    // Mark delivery as succeeded
    delivery.status         = "delivered";
    delivery.responseCode   = response.status;
    delivery.responseTimeMs = responseTimeMs;
    delivery.responseBody   = JSON.stringify(response.data).slice(0, 500);
    delivery.nextAttemptAt  = null;
    await delivery.save();

    // Update webhook stats
    await Webhook.findByIdAndUpdate(webhook._id, {
      $inc: { totalDeliveries: 1, successfulDeliveries: 1 },
      $set: {
        lastDeliveryAt:      new Date(),
        lastDeliveryStatus:  "delivered",
        consecutiveFailures: 0,
        status:              "active",
      },
    });

    logger.info("Webhook delivered", {
      webhookId: webhook._id,
      eventType: event.type,
      url:       webhook.url,
      status:    response.status,
      ms:        responseTimeMs,
    });

    return { success: true };

  } catch (err) {
    const responseTimeMs = Date.now() - start;
    const isAxiosError   = err.response != null;
    const statusCode     = isAxiosError ? err.response.status : null;

    delivery.status         = "failed";
    delivery.responseCode   = statusCode;
    delivery.responseTimeMs = responseTimeMs;
    delivery.errorMessage   = err.message;

    const nextAttempt = attempt + 1;
    if (nextAttempt <= config.webhook.maxAttempts) {
      delivery.nextAttemptAt = new Date(Date.now() + backoffSeconds(attempt));
      delivery.status        = "pending"; // will be retried
    }
    await delivery.save();

    // Update webhook failure stats
    const consecutiveFailures = (webhook.consecutiveFailures || 0) + 1;
    await Webhook.findByIdAndUpdate(webhook._id, {
      $inc: { totalDeliveries: 1 },
      $set: {
        lastDeliveryAt:      new Date(),
        lastDeliveryStatus:  "failed",
        consecutiveFailures,
        // Mark as "failing" after 3 consecutive failures
        status: consecutiveFailures >= 3 ? "failing" : webhook.status,
      },
    });

    logger.warn("Webhook delivery failed", {
      webhookId:   webhook._id,
      url:         webhook.url,
      eventType:   event.type,
      attempt,
      error:       err.message,
      nextAttempt: delivery.nextAttemptAt,
    });

    return { success: false, error: err.message };
  }
};

/**
 * Fan out a single event to ALL matching active webhooks.
 * Called immediately when an event is published.
 */
const fanOutEvent = async (event) => {
  const webhooks = await Webhook.find({
    status: "active",
    events: event.type,
  });

  if (webhooks.length === 0) {
    await Event.findByIdAndUpdate(event._id, { status: "delivered" });
    return;
  }

  logger.info("Fan-out starting", { eventType: event.type, webhookCount: webhooks.length });

  const results = await Promise.allSettled(
    webhooks.map((wh) => deliverToWebhook(event, wh, 1))
  );

  const succeeded = results.filter((r) => r.status === "fulfilled" && r.value?.success).length;
  const failed    = results.length - succeeded;

  await Event.findByIdAndUpdate(event._id, {
    status:         failed === 0 ? "delivered" : succeeded === 0 ? "failed" : "partial",
    deliveredCount: succeeded,
    failedCount:    failed,
  });
};

module.exports = { fanOutEvent, deliverToWebhook };
