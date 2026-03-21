const { Router } = require("express");
const { authenticate, authorize } = require("../middleware/auth");
const { createServiceProxy } = require("../utils/proxy");
const config = require("../config");

const router = Router();

const billingProxy = createServiceProxy(
  config.services.billing,
  // Explicit rewrites — longest/most-specific patterns first
  {
    "^/subscriptions/([^/]+)":         "/api/billing/subscriptions/$1",
    "^/subscriptions":                 "/api/billing/subscriptions",
    "^/payments/([^/]+)/retry":        "/api/billing/payments/$1/retry",
    "^/payments/([^/]+)":              "/api/billing/payments/$1",
    "^/payments":                      "/api/billing/payments",
    "^/plans/([^/]+)":                 "/api/billing/plans/$1",
    "^/plans":                         "/api/billing/plans",
    "^/stats":                         "/api/billing/stats",
  },
  "billing-service"
);

router.use(authenticate);

router.get("/stats", billingProxy);

router.get("/plans",           billingProxy);
router.post("/plans",          authorize("admin"), billingProxy);
router.patch("/plans/:id",     authorize("admin"), billingProxy);
router.delete("/plans/:id",    authorize("admin"), billingProxy);

router.get("/subscriptions",          billingProxy);
router.post("/subscriptions",         billingProxy);
router.get("/subscriptions/:id",      billingProxy);
router.delete("/subscriptions/:id",   billingProxy);

router.get("/payments",              billingProxy);
router.get("/payments/:id",          billingProxy);
router.post("/payments/:id/retry",   billingProxy);

module.exports = router;
