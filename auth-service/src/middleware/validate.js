const { body, validationResult } = require("express-validator");

/**
 * Runs after all validation chains in a route handler.
 * If any chain fails, returns 422 with every error listed.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      error: {
        message: "Validation failed",
        details: errors.array().map((e) => ({
          field:   e.path,
          message: e.msg,
        })),
      },
    });
  }
  next();
};

// ── Reusable chains ──────────────────────────────────────────────────────────

const registerRules = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 2, max: 80 }).withMessage("Name must be 2–80 characters"),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Must be a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/).withMessage("Password must contain at least one number"),
];

const loginRules = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Must be a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required"),
];

const refreshRules = [
  body("refreshToken")
    .notEmpty().withMessage("refreshToken is required"),
];

const logoutRules = [
  body("refreshToken")
    .notEmpty().withMessage("refreshToken is required"),
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  refreshRules,
  logoutRules,
};
