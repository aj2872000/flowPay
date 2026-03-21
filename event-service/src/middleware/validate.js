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

const createWebhookRules = [
  body("url")
    .trim()
    .notEmpty().withMessage("url is required")
    .isURL({ protocols: ["http", "https"], require_protocol: true })
    .withMessage("url must be a valid HTTP/HTTPS URL"),
  body("events")
    .isArray({ min: 1 }).withMessage("events must be a non-empty array"),
  body("events.*")
    .isString().withMessage("Each event must be a string"),
];

const updateWebhookRules = [
  body("url")
    .optional()
    .trim()
    .isURL({ protocols: ["http", "https"], require_protocol: true })
    .withMessage("url must be a valid HTTP/HTTPS URL"),
  body("events")
    .optional()
    .isArray({ min: 1 }).withMessage("events must be a non-empty array"),
];

module.exports = { validate, createWebhookRules, updateWebhookRules };
