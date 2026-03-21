const { Router }   = require("express");
const mongoose     = require("mongoose");

const router = Router();

/**
 * GET /health
 * Used by the API gateway's /health endpoint to check service reachability.
 */
router.get("/", (req, res) => {
  const dbState = mongoose.connection.readyState;
  // 0=disconnected 1=connected 2=connecting 3=disconnecting
  const dbStatus = ["disconnected", "connected", "connecting", "disconnecting"][dbState] || "unknown";
  const healthy  = dbState === 1;

  return res.status(healthy ? 200 : 503).json({
    status:      healthy ? "healthy" : "degraded",
    service:     "auth-service",
    uptime:      process.uptime(),
    timestamp:   new Date().toISOString(),
    database:    dbStatus,
  });
});

module.exports = router;
