const { Router } = require("express");
const { authenticate } = require("../middleware/auth");
const { createServiceProxy } = require("../utils/proxy");
const config = require("../config");

const router = Router();

// Gateway mounts at /api/simulator
// Simulator service internally uses /api/simulate (no 'r')
// pathRewrite: "^/scenarios" → "/api/simulate/scenarios"
const simulatorProxy = createServiceProxy(
  config.services.simulator,
  {
    "^/scenarios": "/api/simulate/scenarios",
    "^/charge":    "/api/simulate/charge",
  },
  "payment-simulator"
);

router.use(authenticate);

router.get("/scenarios", simulatorProxy);
router.post("/charge",   simulatorProxy);

module.exports = router;
