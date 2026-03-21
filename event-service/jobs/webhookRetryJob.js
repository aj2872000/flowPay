const cron     = require("node-cron");
const Delivery = require("../models/delivery.model");
const Webhook  = require("../models/webhook.model");
const Event    = require("../models/event.model");
const { deliverToWebhook } = require("../utils/webhookDelivery");
const config   = require("../config");
const logger   = require("../utils/logger");

let task = null;

const startWebhookRetryJob = () => {
  if (task) return;

  task = cron.schedule(config.webhook.retryCron, async () => {
    logger.debug("Webhook retry job: scanning…");

    try {
      // Find deliveries that are pending a retry and whose next attempt time has passed
      const due = await Delivery.find({
        status:        "pending",
        nextAttemptAt: { $lte: new Date() },
        attempt:       { $lt: config.webhook.maxAttempts },
      })
        .populate("webhookId")
        .populate("eventId")
        .limit(50);

      if (due.length === 0) return;

      logger.info(`Webhook retry job: processing ${due.length} delivery/deliveries`);

      for (const delivery of due) {
        // Skip if webhook or event was deleted
        if (!delivery.webhookId || !delivery.eventId) {
          await Delivery.deleteOne({ _id: delivery._id });
          continue;
        }

        try {
          await deliverToWebhook(delivery.eventId, delivery.webhookId, delivery.attempt + 1);
        } catch (err) {
          logger.error("Webhook retry attempt threw", {
            deliveryId: delivery._id,
            error:      err.message,
          });
        }
      }
    } catch (err) {
      logger.error("Webhook retry job: query failed", { error: err.message });
    }
  });

  logger.info("Webhook retry cron started", { schedule: config.webhook.retryCron });
};

const stopWebhookRetryJob = () => {
  if (task) {
    task.stop();
    task = null;
    logger.info("Webhook retry cron stopped");
  }
};

module.exports = { startWebhookRetryJob, stopWebhookRetryJob };
