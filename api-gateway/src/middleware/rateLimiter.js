const rateLimit = require("express-rate-limit");
const config = require("../config");
const { sendError } = require("../utils/response");
const logger = require("../utils/logger");

/**
 * Generic rate limiter factory so we can create different limits
 * for different route groups with a consistent error shape.
 */
const createLimiter = ({ windowMs, max, name = "default" }) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,  // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false,
    keyGenerator: (req) => req.ip,
    handler: (req, res) => {
      logger.warn("Rate limit exceeded", {
        limiter: name,
        ip: req.ip,
        path: req.path,
      });
      return sendError(
        res,
        `Too many requests – please try again after ${Math.ceil(windowMs / 60000)} minute(s)`,
        429
      );
    },
  });

// Applied to every incoming request
const globalLimiter = createLimiter({
  windowMs: config.rateLimit.global.windowMs,
  max:      config.rateLimit.global.max,
  name:     "global",
});

// Applied specifically to /api/auth/* (brute-force protection)
const authLimiter = createLimiter({
  windowMs: config.rateLimit.auth.windowMs,
  max:      config.rateLimit.auth.max,
  name:     "auth",
});

module.exports = { globalLimiter, authLimiter };
