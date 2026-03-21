const Plan     = require("../models/plan.model");
const Subscription = require("../models/subscription.model");
const logger   = require("../utils/logger");

// GET /api/billing/plans
const listPlans = async (req, res, next) => {
  try {
    const plans = await Plan.find({ isActive: true }).sort({ price: 1 });

    // Attach live subscriber count to each plan
    const withCounts = await Promise.all(
      plans.map(async (p) => {
        const subscribers = await Subscription.countDocuments({ planId: p._id, status: "active" });
        return { ...p.toObject(), subscribers };
      })
    );

    return res.status(200).json({ success: true, data: { plans: withCounts } });
  } catch (err) { next(err); }
};

// POST /api/billing/plans
const createPlan = async (req, res, next) => {
  try {
    const { name, price, currency, interval, features } = req.body;
    const plan = await Plan.create({ name, price, currency, interval, features });
    logger.info("Plan created", { planId: plan._id, name });
    return res.status(201).json({ success: true, data: plan });
  } catch (err) { next(err); }
};

// PATCH /api/billing/plans/:id
const updatePlan = async (req, res, next) => {
  try {
    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!plan) return res.status(404).json({ success: false, error: { message: "Plan not found" } });
    return res.status(200).json({ success: true, data: plan });
  } catch (err) { next(err); }
};

// DELETE /api/billing/plans/:id  (soft archive)
const archivePlan = async (req, res, next) => {
  try {
    const plan = await Plan.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!plan) return res.status(404).json({ success: false, error: { message: "Plan not found" } });
    logger.info("Plan archived", { planId: plan._id });
    return res.status(200).json({ success: true, data: { message: "Plan archived", planId: plan._id } });
  } catch (err) { next(err); }
};

module.exports = { listPlans, createPlan, updatePlan, archivePlan };
