const Payment         = require("../models/payment.model");
const Subscription    = require("../models/subscription.model");
const config          = require("../config");
const logger          = require("../utils/logger");
const { charge }      = require("../utils/paymentGateway");
const { publishEvent }= require("../utils/eventPublisher");

// ── shared: run one charge attempt ───────────────────────────────────────────
const attemptCharge = async (payment) => {
  const sub = await Subscription.findById(payment.subscriptionId);
  const result = await charge({
    customer: payment.customer,
    amount:   payment.amount,
    currency: payment.currency,
    method:   payment.method,
    scenario: "success",   // real integration: derive from stored payment method
  });

  payment.lastAttemptAt = new Date();

  if (result.status === "succeeded") {
    payment.status       = "succeeded";
    payment.simulatorRef = result.id;
    payment.nextRetryAt  = null;
    if (sub) {
      const addMonths = (d, n) => { const x = new Date(d); x.setMonth(x.getMonth() + n); return x; };
      sub.status            = "active";
      sub.nextBillingDate   = addMonths(new Date(), 1);
      sub.currentPeriodEnd  = addMonths(new Date(), 1);
      await sub.save();
    }
    await publishEvent("payment.succeeded", { pay_id: payment._id, amount: payment.amount });
  } else {
    payment.retries       += 1;
    payment.failureReason  = result.message || "unknown";

    if (payment.retries >= payment.maxRetries) {
      payment.status      = "failed";
      payment.nextRetryAt = null;
      if (sub) { sub.status = "past_due"; await sub.save(); }
      await publishEvent("payment.failed", { pay_id: payment._id, reason: payment.failureReason });
    } else {
      // Schedule next retry
      const delayMs    = config.retry.delayMinutes * 60 * 1000;
      payment.nextRetryAt = new Date(Date.now() + delayMs);
      await publishEvent("payment.retry_scheduled", {
        pay_id:   payment._id,
        retry_at: payment.nextRetryAt,
        attempt:  payment.retries,
      });
    }
  }

  await payment.save();
  return payment;
};

// GET /api/billing/payments
const listPayments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const [data, total] = await Promise.all([
      Payment.find(query).sort({ createdAt: -1 }).skip((+page - 1) * +limit).limit(+limit).lean(),
      Payment.countDocuments(query),
    ]);
    return res.status(200).json({ success: true, data: { data, total, page: +page, limit: +limit } });
  } catch (err) { next(err); }
};

// GET /api/billing/payments/:id
const getPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id).populate("subscriptionId");
    if (!payment) return res.status(404).json({ success: false, error: { message: "Payment not found" } });
    return res.status(200).json({ success: true, data: payment });
  } catch (err) { next(err); }
};

// POST /api/billing/payments/:id/retry
const retryPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ success: false, error: { message: "Payment not found" } });
    if (payment.status === "succeeded") {
      return res.status(400).json({ success: false, error: { message: "Payment already succeeded" } });
    }
    if (payment.retries >= payment.maxRetries) {
      return res.status(400).json({ success: false, error: { message: "Max retries exceeded" } });
    }

    logger.info("Manual retry initiated", { paymentId: payment._id });
    payment.status = "processing";
    const updated  = await attemptCharge(payment);

    return res.status(200).json({ success: true, data: updated });
  } catch (err) { next(err); }
};

module.exports = { listPayments, getPayment, retryPayment, attemptCharge };
