const { Router } = require("express");
const { authenticate, authorize } = require("../middleware/auth");
const { createServiceProxy } = require("../utils/proxy");
const config = require("../config");

const router = Router();

// Single proxy that rewrites /api/billing/* → /api/billing/*
// Express strips /api/billing before this router sees it, so req.path = /stats, /plans, etc.
// We rewrite back: "^" + "" → "/api/billing" effectively prepends the prefix.
// Using a function rewrite (supported in hpm v2) instead of regex capture groups.
const billingProxy = createServiceProxy(
  config.services.billing,
  (path) => `/api/billing${path}`,
  "billing-service"
);

router.use(authenticate);

// Stats
router.get("/stats", billingProxy);

// Plans — authorize guard stays here in the gateway
router.get("/plans",        billingProxy);
router.post("/plans",       authorize("admin"), billingProxy);
router.patch("/plans/:id",  authorize("admin"), billingProxy);
router.delete("/plans/:id", authorize("admin"), billingProxy);

// Subscriptions
router.get("/subscriptions",        billingProxy);
router.post("/subscriptions",       billingProxy);
router.get("/subscriptions/:id",    billingProxy);
router.delete("/subscriptions/:id", billingProxy);

// Payments
router.get("/payments",            billingProxy);
router.get("/payments/:id",        billingProxy);
router.post("/payments/:id/retry", billingProxy);

module.exports = router;
