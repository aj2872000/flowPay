const { Router } = require("express");
const { authenticate, authorize } = require("../middleware/auth");
const { createServiceProxy } = require("../utils/proxy");
const config = require("../config");

const router = Router();

const accountProxy = createServiceProxy(
  config.services.account,
  (path) => `/api/accounts${path}`,
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
