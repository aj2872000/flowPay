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

const createSubscriptionRules = [
  body("customer").trim().notEmpty().withMessage("customer is required"),
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("planId").notEmpty().withMessage("planId is required"),
];

const createPlanRules = [
  body("name").trim().notEmpty().withMessage("name is required"),
  body("price").isFloat({ min: 0 }).withMessage("price must be a positive number"),
  body("interval").optional().isIn(["month", "year"]).withMessage("interval must be month or year"),
];

const cancelSubscriptionRules = [
  body("reason").optional().trim(),
  body("cancelImmediately").optional().isBoolean(),
];

module.exports = { validate, createSubscriptionRules, createPlanRules, cancelSubscriptionRules };
