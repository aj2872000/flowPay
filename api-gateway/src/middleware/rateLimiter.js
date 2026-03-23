const rateLimit = require("express-rate-limit");
const config    = require("../config");
const { sendError } = require("../utils/response");
const logger    = require("../utils/logger");

const createLimiter = ({ windowMs, max, name = "default" }) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders:   false,
    // Railway sits behind a proxy — use X-Forwarded-For, fall back to req.ip,
    // fall back to "unknown" so the limiter never crashes on undefined
    keyGenerator: (req) => {
      const forwarded = req.headers["x-forwarded-for"];
      if (forwarded) return forwarded.split(",")[0].trim();
      return req.ip || req.socket?.remoteAddress || "unknown";
    },
    skip: (req) => req.method === "OPTIONS", // never rate-limit preflights
    handler: (req, res) => {
      logger.warn("Rate limit exceeded", { limiter: name, path: req.path });
      return sendError(
        res,
        `Too many requests – retry after ${Math.ceil(windowMs / 60000)} minute(s)`,
        429
      );
    },
  });

const globalLimiter = createLimiter({
  windowMs: config.rateLimit.global.windowMs,
  max:      config.rateLimit.global.max,
  name:     "global",
});

const authLimiter = createLimiter({
  windowMs: config.rateLimit.auth.windowMs,
  max:      config.rateLimit.auth.max,
  name:     "auth",
});

module.exports = { globalLimiter, authLimiter };
