const cron    = require("node-cron");
const Payment = require("../models/payment.model");
const { attemptCharge } = require("../controllers/payment.controller");
const config  = require("../config");
const logger  = require("../utils/logger");

let task = null;

const startRetryJob = () => {
  if (task) return; // already running

  task = cron.schedule(config.retry.cronSchedule, async () => {
    logger.debug("Retry job: scanning for due payments…");

    try {
      // Find payments that are failed (not permanently failed), have retries remaining,
      // and whose nextRetryAt is in the past
      const due = await Payment.find({
        status:      { $in: ["processing"] },
        retries:     { $lt: config.retry.maxAttempts },
        nextRetryAt: { $lte: new Date() },
      }).limit(50); // process max 50 per tick to avoid memory spikes

      if (due.length === 0) {
        logger.debug("Retry job: nothing to process");
        return;
      }

      logger.info(`Retry job: processing ${due.length} payment(s)`);

      // Process sequentially to avoid hammering the simulator
      for (const payment of due) {
        try {
          await attemptCharge(payment);
        } catch (err) {
          logger.error("Retry job: charge attempt threw", {
            paymentId: payment._id,
            error: err.message,
          });
        }
      }
    } catch (err) {
      logger.error("Retry job: query failed", { error: err.message });
    }
  });

  logger.info("Payment retry cron started", { schedule: config.retry.cronSchedule });
};

const stopRetryJob = () => {
  if (task) {
    task.stop();
    task = null;
    logger.info("Payment retry cron stopped");
  }
};

module.exports = { startRetryJob, stopRetryJob };
