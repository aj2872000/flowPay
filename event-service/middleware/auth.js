const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const userId = req.headers["x-user-id"];
  const email  = req.headers["x-user-email"];
  const role   = req.headers["x-user-role"];

  if (userId && email) {
    req.user = { id: userId, email, role };
    return next();
  }

  const auth = req.headers["authorization"];
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: { message: "Unauthorized" } });
  }
  try {
    const decoded = jwt.verify(auth.slice(7), process.env.JWT_SECRET || "changeme_in_production");
    req.user = { id: decoded.id || decoded.sub, email: decoded.email, role: decoded.role };
    next();
  } catch {
    return res.status(401).json({ success: false, error: { message: "Invalid or expired token" } });
  }
};

module.exports = { authenticate };
