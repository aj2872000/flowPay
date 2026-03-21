const jwt = require("jsonwebtoken");
const config = require("../config");
const logger = require("../utils/logger");
const { sendError } = require("../utils/response");

/**
 * Verifies the JWT in the Authorization header.
 * Attaches the decoded payload to req.user.
 * Forwards the user info to downstream services via X-User-* headers.
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return sendError(res, "Authorization header is missing", 401);
  }

  if (!authHeader.startsWith("Bearer ")) {
    return sendError(res, "Authorization header must use Bearer scheme", 401);
  }

  const token = authHeader.slice(7); // strip "Bearer "

  try {
    const decoded = jwt.verify(token, config.jwt.secret, {
      algorithms: [config.jwt.algorithm],
    });

    req.user = decoded;

    // Forward user identity to downstream services as headers
    // so they don't need to re-verify the JWT themselves
    req.headers["x-user-id"]    = decoded.id || decoded.sub || "";
    req.headers["x-user-email"] = decoded.email || "";
    req.headers["x-user-role"]  = decoded.role  || "";

    logger.debug("JWT verified", { userId: req.user.id, path: req.path });
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return sendError(res, "Token has expired", 401);
    }
    if (err.name === "JsonWebTokenError") {
      return sendError(res, "Invalid token", 401);
    }
    logger.error("JWT verification failed", { error: err.message });
    return sendError(res, "Authentication failed", 401);
  }
};

/**
 * Role-based guard factory.
 * Usage: authorize("admin") or authorize(["admin","billing"])
 */
const authorize = (requiredRoles) => {
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, "Not authenticated", 401);
    }

    if (!roles.includes(req.user.role)) {
      logger.warn("Forbidden – insufficient role", {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles,
        path: req.path,
      });
      return sendError(res, "Forbidden – insufficient permissions", 403);
    }

    next();
  };
};

module.exports = { authenticate, authorize };
