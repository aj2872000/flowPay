const jwt = require("jsonwebtoken");

/**
 * Accepts either gateway-forwarded identity headers OR a raw Bearer token.
 * The simulator also allows calls from billing-service which sends no user
 * headers — those are identified by the x-internal-service header.
 */
const authenticate = (req, res, next) => {
  // Internal service-to-service call (billing-service → simulator)
  if (req.headers["x-internal-service"]) {
    req.user   = { id: "service", role: "service" };
    req.isInternal = true;
    return next();
  }

  // Gateway-forwarded identity
  const userId = req.headers["x-user-id"];
  const email  = req.headers["x-user-email"];
  const role   = req.headers["x-user-role"];

  if (userId && email) {
    req.user = { id: userId, email, role };
    return next();
  }

  // Raw Bearer token (direct calls / tests)
  const auth = req.headers["authorization"];
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: { message: "Unauthorized" } });
  }
  try {
    const decoded = jwt.verify(
      auth.slice(7),
      process.env.JWT_SECRET || "changeme_in_production"
    );
    req.user = { id: decoded.id || decoded.sub, email: decoded.email, role: decoded.role };
    next();
  } catch {
    return res.status(401).json({ success: false, error: { message: "Invalid or expired token" } });
  }
};

module.exports = { authenticate };
