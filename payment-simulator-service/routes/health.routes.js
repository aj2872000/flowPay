const { Router } = require("express");
const router     = Router();

router.get("/", (req, res) => {
  return res.status(200).json({
    status:    "healthy",
    service:   "payment-simulator-service",
    uptime:    process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
