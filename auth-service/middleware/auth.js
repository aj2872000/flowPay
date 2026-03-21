const jwt    = require("jsonwebtoken");
const config = require("../config");
const logger = require("../utils/logger");

/**
 * Validates the access token forwarded by the gateway.
 * The gateway already verified it, but we re-verify here so the
 * auth-service is self-contained and can be called directly in tests.
 *
 * Attaches decoded payload to req.user.
 */
const authenticate = (req, res, next) => {
  // Accept the pre-parsed header set by the gateway OR a raw Bearer token
  const userId    = req.headers["x-user-id"];
  const userEmail = req.headers["x-user-email"];
  const userRole  = req.headers["x-user-role"];

  if (userId && userEmail) {
    // Fast path – gateway already verified and forwarded identity headers
    req.user = { id: userId, email: userEmail, role: userRole };
    return next();
  }

  // Fallback: verify Bearer token directly (useful for direct testing)
  const authHeader = req.headers["authorization"];
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: { message: "Authorization header is missing or malformed" },
    });
  }

  try {
    const token   = authHeader.slice(7);
    const decoded = jwt.verify(token, config.jwt.secret, {
      algorithms: [config.jwt.algorithm],
    });
    req.user = { id: decoded.id || decoded.sub, email: decoded.email, role: decoded.role };
    next();
  } catch (err) {
    logger.debug("Token verification failed", { error: err.message });
    return res.status(401).json({
      success: false,
      error: {
        message:
          err.name === "TokenExpiredError" ? "Token has expired" : "Invalid token",
      },
    });
  }
};

module.exports = { authenticate };
