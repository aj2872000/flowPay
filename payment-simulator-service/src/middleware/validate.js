const { body, validationResult } = require("express-validator");
const { SCENARIOS } = require("../utils/scenarioEngine");

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

const chargeRules = [
  body("customer")
    .trim()
    .notEmpty().withMessage("customer is required"),

  body("amount")
    .notEmpty().withMessage("amount is required")
    .isFloat({ min: 0.01 }).withMessage("amount must be a positive number"),

  body("currency")
    .optional()
    .isLength({ min: 3, max: 3 }).withMessage("currency must be a 3-letter ISO code")
    .toUpperCase(),

  body("method")
    .optional()
    .isString().withMessage("method must be a string"),

  body("scenario")
    .optional()
    .isIn(Object.keys(SCENARIOS))
    .withMessage(`scenario must be one of: ${Object.keys(SCENARIOS).join(", ")}`),
];

module.exports = { validate, chargeRules };
