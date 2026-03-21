const Subscription    = require("../models/subscription.model");
const Payment         = require("../models/payment.model");
const Plan            = require("../models/plan.model");
const config          = require("../config");
const logger          = require("../utils/logger");
const { publishEvent }= require("../utils/eventPublisher");

const addDays   = (date, days) => new Date(date.getTime() + days * 86400000);
const addMonths = (date, n)    => { const d = new Date(date); d.setMonth(d.getMonth() + n); return d; };

// GET /api/billing/subscriptions
const listSubscriptions = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) query.$or = [
      { customer: { $regex: search, $options: "i" } },
      { email:    { $regex: search, $options: "i" } },
    ];
    const [data, total] = await Promise.all([
      Subscription.find(query).sort({ createdAt: -1 })
        .skip((+page - 1) * +limit).limit(+limit).lean(),
      Subscription.countDocuments(query),
    ]);
    return res.status(200).json({ success: true, data: { data, total, page: +page, limit: +limit } });
  } catch (err) { next(err); }
};

// GET /api/billing/subscriptions/:id
const getSubscription = async (req, res, next) => {
  try {
    const sub = await Subscription.findById(req.params.id).populate("planId");
    if (!sub) return res.status(404).json({ success: false, error: { message: "Subscription not found" } });
    // Include recent payments for this subscription
    const payments = await Payment.find({ subscriptionId: sub._id })
      .sort({ createdAt: -1 }).limit(10).lean();
    return res.status(200).json({ success: true, data: { ...sub.toObject(), payments } });
  } catch (err) { next(err); }
};

// POST /api/billing/subscriptions
const createSubscription = async (req, res, next) => {
  try {
    const { customer, email, planId, trialDays } = req.body;

    const plan = await Plan.findById(planId);
    if (!plan || !plan.isActive) {
      return res.status(404).json({ success: false, error: { message: "Plan not found or inactive" } });
    }

    const now         = new Date();
    const trialLength = trialDays !== undefined ? parseInt(trialDays, 10) : config.trial.defaultDays;
    const trialEndsAt = trialLength > 0 ? addDays(now, trialLength) : null;
    const periodEnd   = addMonths(now, 1);

    const sub = await Subscription.create({
      customerId:         req.user.id,
      customer,
      email,
      planId:             plan._id,
      planName:           plan.name,
      amount:             plan.price,
      currency:           plan.currency || "USD",
      status:             trialEndsAt ? "trialing" : "active",
      currentPeriodStart: now,
      currentPeriodEnd:   periodEnd,
      nextBillingDate:    trialEndsAt || periodEnd,
      trialEndsAt,
    });

    logger.info("Subscription created", { subId: sub._id, plan: plan.name, trialDays: trialLength });
    await publishEvent("subscription.created", { sub_id: sub._id, plan: plan.name, customer });

    // ── Create & immediately attempt a payment if no trial ────────────────────
    if (!trialEndsAt) {
      const payment = await Payment.create({
        subscriptionId: sub._id,
        customerId:     req.user.id,
        customer,
        amount:         plan.price,
        currency:       plan.currency || "USD",
        status:         "processing",
        method:         "card_visa",
        maxRetries:     config.retry.maxAttempts,
      });

      // Run charge asynchronously so the subscription creation response is fast
      setImmediate(async () => {
        try {
          const { attemptCharge } = require("./payment.controller");
          await attemptCharge(payment);
          logger.info("Initial charge completed", { subId: sub._id, paymentId: payment._id });
        } catch (err) {
          logger.error("Initial charge failed", { subId: sub._id, error: err.message });
        }
      });
    } else {
      // On trial — create a future payment record so it appears in the payments list
      await Payment.create({
        subscriptionId: sub._id,
        customerId:     req.user.id,
        customer,
        amount:         plan.price,
        currency:       plan.currency || "USD",
        status:         "processing",
        method:         "card_visa",
        maxRetries:     config.retry.maxAttempts,
        nextRetryAt:    trialEndsAt, // charge when trial ends
      });
      logger.info("Trial payment scheduled", { subId: sub._id, chargeAt: trialEndsAt });
    }

    return res.status(201).json({ success: true, data: sub });
  } catch (err) { next(err); }
};

// DELETE /api/billing/subscriptions/:id
const cancelSubscription = async (req, res, next) => {
  try {
    const sub = await Subscription.findById(req.params.id);
    if (!sub) return res.status(404).json({ success: false, error: { message: "Subscription not found" } });
    if (sub.status === "canceled") {
      return res.status(400).json({ success: false, error: { message: "Subscription already canceled" } });
    }
    const { reason = "user_request", cancelImmediately = false } = req.body;
    const now = new Date();
    sub.status       = "canceled";
    sub.canceledAt   = now;
    sub.cancelReason = reason;
    sub.endsAt       = cancelImmediately ? now : sub.currentPeriodEnd;
    await sub.save();
    logger.info("Subscription canceled", { subId: sub._id });
    await publishEvent("subscription.canceled", { sub_id: sub._id, reason });
    return res.status(200).json({ success: true, data: sub });
  } catch (err) { next(err); }
};

// GET /api/billing/stats
const getStats = async (req, res, next) => {
  try {
    const now        = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevStart  = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevEnd    = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      activeSubs, prevActiveSubs,
      payments,   prevPayments,
      failedNow,  failedPrev,
    ] = await Promise.all([
      Subscription.countDocuments({ status: "active" }),
      Subscription.countDocuments({ status: "active", createdAt: { $lt: monthStart } }),
      Payment.find({ status: "succeeded", createdAt: { $gte: monthStart } }),
      Payment.find({ status: "succeeded", createdAt: { $gte: prevStart, $lte: prevEnd } }),
      Payment.countDocuments({ status: "failed",    createdAt: { $gte: monthStart } }),
      Payment.countDocuments({ status: "failed",    createdAt: { $gte: prevStart, $lte: prevEnd } }),
    ]);

    const mrr     = payments.reduce((s, p) => s + p.amount, 0);
    const prevMrr = prevPayments.reduce((s, p) => s + p.amount, 0);
    const totalNow  = payments.length + failedNow  || 1;
    const totalPrev = prevPayments.length + failedPrev || 1;
    const pct = (curr, prev) => prev === 0 ? 0 : +((((curr - prev) / prev) * 100).toFixed(1));

    const history = await Promise.all(
      Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        const e = new Date(now.getFullYear(), now.getMonth() - (4 - i), 0);
        return Payment.aggregate([
          { $match: { status: "succeeded", createdAt: { $gte: d, $lte: e } } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]).then(([r]) => ({
          month: d.toLocaleString("en-US", { month: "short" }),
          value: r?.total || 0,
        }));
      })
    );

    return res.status(200).json({
      success: true,
      data: {
        mrr,
        mrrChange:          pct(mrr, prevMrr),
        activeSubscriptions: activeSubs,
        subChange:           pct(activeSubs, prevActiveSubs),
        paymentSuccessRate:  +((payments.length / totalNow) * 100).toFixed(1),
        rateChange:          pct(payments.length / totalNow, prevPayments.length / totalPrev),
        failedPayments:      failedNow,
        failedChange:        pct(failedNow, failedPrev),
        mrrHistory:          history,
      },
    });
  } catch (err) { next(err); }
};

module.exports = { listSubscriptions, getSubscription, createSubscription, cancelSubscription, getStats };
