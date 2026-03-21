const { Router } = require("express");
const mongoose   = require("mongoose");
const router     = Router();

router.get("/", (req, res) => {
  const dbState  = mongoose.connection.readyState;
  const dbStatus = ["disconnected","connected","connecting","disconnecting"][dbState] || "unknown";
  const healthy  = dbState === 1;
  return res.status(healthy ? 200 : 503).json({
    status: healthy ? "healthy" : "degraded",
    service: "account-service",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: dbStatus,
  });
});

module.exports = router;
