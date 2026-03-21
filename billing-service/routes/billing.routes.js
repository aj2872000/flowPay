const { Router } = require("express");
const { authenticate, authorize } = require("../middleware/auth");
const { validate, createSubscriptionRules, createPlanRules, cancelSubscriptionRules } = require("../middleware/validate");
const { listPlans, createPlan, updatePlan, archivePlan } = require("../controllers/plan.controller");
const { listSubscriptions, getSubscription, createSubscription, cancelSubscription, getStats } = require("../controllers/subscription.controller");
const { listPayments, getPayment, retryPayment } = require("../controllers/payment.controller");

const router = Router();
router.use(authenticate);

// Stats
router.get("/stats", getStats);

// Plans
router.get("/plans",          listPlans);
router.post("/plans",         authorize("admin"), createPlanRules, validate, createPlan);
router.patch("/plans/:id",    authorize("admin"), updatePlan);
router.delete("/plans/:id",   authorize("admin"), archivePlan);

// Subscriptions
router.get("/subscriptions",          listSubscriptions);
router.post("/subscriptions",         createSubscriptionRules, validate, createSubscription);
router.get("/subscriptions/:id",      getSubscription);
router.delete("/subscriptions/:id",   cancelSubscriptionRules, validate, cancelSubscription);

// Payments
router.get("/payments",               listPayments);
router.get("/payments/:id",           getPayment);
router.post("/payments/:id/retry",    retryPayment);

module.exports = router;
