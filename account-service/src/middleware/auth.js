const jwt    = require("jsonwebtoken");

/**
 * Reads identity from gateway-forwarded headers (x-user-id, x-user-email, x-user-role).
 * Falls back to verifying a raw Bearer token for direct testing.
 */
const authenticate = (req, res, next) => {
  const userId = req.headers["x-user-id"];
  const email  = req.headers["x-user-email"];
  const role   = req.headers["x-user-role"];

  if (userId && email) {
    req.user = { id: userId, email, role };
    return next();
  }

  // Fallback for direct calls 
  const auth = req.headers["authorization"];
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: { message: "Unauthorized" } });
  }
  try {
    const secret  = process.env.JWT_SECRET || "changeme_in_production";
    const decoded = jwt.verify(auth.slice(7), secret);
    req.user = { id: decoded.id || decoded.sub, email: decoded.email, role: decoded.role };
    next();
  } catch {
    return res.status(401).json({ success: false, error: { message: "Invalid or expired token" } });
  }
};

module.exports = { authenticate };
