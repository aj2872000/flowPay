const Webhook  = require("../models/webhook.model");
const Delivery = require("../models/delivery.model");
const Event    = require("../models/event.model");
const { deliverToWebhook } = require("../utils/webhookDelivery");
const logger   = require("../utils/logger");

// GET /api/events/webhooks
const listWebhooks = async (req, res, next) => {
  try {
    const webhooks = await Webhook.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: { webhooks } });
  } catch (err) { next(err); }
};

// POST /api/events/webhooks
const createWebhook = async (req, res, next) => {
  try {
    const { url, events, secret } = req.body;
    const webhook = await Webhook.create({
      userId: req.user.id,
      url,
      events,
      ...(secret ? { secret } : {}),
    });

    logger.info("Webhook registered", { webhookId: webhook._id, url });

    // Return without the secret field
    return res.status(201).json({
      success: true,
      data: {
        id:        webhook._id,
        url:       webhook.url,
        events:    webhook.events,
        status:    webhook.status,
        createdAt: webhook.createdAt,
      },
    });
  } catch (err) { next(err); }
};

// PATCH /api/events/webhooks/:id
const updateWebhook = async (req, res, next) => {
  try {
    const webhook = await Webhook.findOne({ _id: req.params.id, userId: req.user.id });
    if (!webhook) {
      return res.status(404).json({ success: false, error: { message: "Webhook not found" } });
    }

    const { url, events, status } = req.body;
    if (url)    webhook.url    = url;
    if (events) webhook.events = events;
    if (status) webhook.status = status;
    await webhook.save();

    return res.status(200).json({ success: true, data: webhook });
  } catch (err) { next(err); }
};

// DELETE /api/events/webhooks/:id
const deleteWebhook = async (req, res, next) => {
  try {
    const result = await Webhook.deleteOne({ _id: req.params.id, userId: req.user.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: { message: "Webhook not found" } });
    }
    // Clean up delivery history
    await Delivery.deleteMany({ webhookId: req.params.id });

    logger.info("Webhook deleted", { webhookId: req.params.id });
    return res.status(200).json({ success: true, data: { message: "Webhook deleted successfully" } });
  } catch (err) { next(err); }
};

// POST /api/events/webhooks/:id/test
const testWebhook = async (req, res, next) => {
  try {
    const webhook = await Webhook.findOne({ _id: req.params.id, userId: req.user.id });
    if (!webhook) {
      return res.status(404).json({ success: false, error: { message: "Webhook not found" } });
    }

    // Create a synthetic test event
    const testEvent = await Event.create({
      type:    "webhook.test",
      service: "event-service",
      payload: { message: "This is a test delivery from FlowPay", webhookId: webhook._id },
    });

    const result = await deliverToWebhook(testEvent, webhook, 1);

    const delivery = await Delivery.findOne({ eventId: testEvent._id, webhookId: webhook._id });

    return res.status(200).json({
      success: true,
      data: {
        webhookId:    webhook._id,
        deliveryId:   delivery?._id,
        status:       result.success ? "delivered" : "failed",
        responseCode: delivery?.responseCode,
        responseTime: delivery?.responseTimeMs,
        error:        result.error || null,
      },
    });
  } catch (err) { next(err); }
};

module.exports = { listWebhooks, createWebhook, updateWebhook, deleteWebhook, testWebhook };
