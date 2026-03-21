const { Router } = require("express");
const mongoose   = require("mongoose");
const router     = Router();

router.get("/", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const healthy = dbState === 1;
  return res.status(healthy ? 200 : 503).json({
    status:    healthy ? "healthy" : "degraded",
    service:   "event-service",
    uptime:    process.uptime(),
    timestamp: new Date().toISOString(),
    database:  ["disconnected","connected","connecting","disconnecting"][dbState] || "unknown",
  });
});

module.exports = router;
