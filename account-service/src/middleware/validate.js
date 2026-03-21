const { body, validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      error: {
        message: "Validation failed",
        details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      },
    });
  }
  next();
};

const updateProfileRules = [
  body("name").optional().trim().isLength({ min: 2, max: 80 }).withMessage("Name must be 2–80 characters"),
  body("email").optional().isEmail().withMessage("Must be a valid email").normalizeEmail(),
];

const updateNotificationsRules = [
  body("paymentFailures").optional().isBoolean(),
  body("newSubscriptions").optional().isBoolean(),
  body("trialEndings").optional().isBoolean(),
  body("webhookErrors").optional().isBoolean(),
  body("monthlyReports").optional().isBoolean(),
];

module.exports = { validate, updateProfileRules, updateNotificationsRules };
