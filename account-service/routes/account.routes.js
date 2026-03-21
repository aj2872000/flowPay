const { Router } = require("express");
const { authenticate } = require("../middleware/auth");
const { validate, updateProfileRules, updateNotificationsRules } = require("../middleware/validate");
const {
  getProfile, updateProfile, getApiKeys,
  rotateApiKey, updateNotifications, deleteAccount,
} = require("../controllers/account.controller");

const router = Router();
router.use(authenticate);

router.get("/profile",          getProfile);
router.patch("/profile",        updateProfileRules, validate, updateProfile);
router.get("/api-keys",         getApiKeys);
router.post("/api-keys/rotate", rotateApiKey);
router.patch("/notifications",  updateNotificationsRules, validate, updateNotifications);
router.delete("/account",       deleteAccount);

module.exports = router;
