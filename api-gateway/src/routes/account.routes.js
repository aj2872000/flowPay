const { Router } = require("express");
const { authenticate, authorize } = require("../middleware/auth");
const { createServiceProxy } = require("../utils/proxy");
const config = require("../config");

const router = Router();

const accountProxy = createServiceProxy(
  config.services.account,
  {
    "^/profile":          "/api/accounts/profile",
    "^/api-keys/rotate":  "/api/accounts/api-keys/rotate",
    "^/api-keys":         "/api/accounts/api-keys",
    "^/notifications":    "/api/accounts/notifications",
    "^/account":          "/api/accounts/account",
  },
  "account-service"
);

router.use(authenticate);

router.get("/profile",          accountProxy);
router.patch("/profile",        accountProxy);
router.get("/api-keys",         accountProxy);
router.post("/api-keys/rotate", accountProxy);
router.patch("/notifications",  accountProxy);
router.delete("/account",       authorize("admin"), accountProxy);

module.exports = router;
