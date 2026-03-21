const { Router } = require("express");
const { authenticate } = require("../middleware/auth");
const { createServiceProxy } = require("../utils/proxy");
const config = require("../config");

const router = Router();

// Gateway: /api/simulator/* → simulator-service: /api/simulate/*
const simulatorProxy = createServiceProxy(
  config.services.simulator,
  (path) => `/api/simulate${path}`,
  "payment-simulator"
);

router.use(authenticate);

router.get("/scenarios", simulatorProxy);
router.post("/charge",   simulatorProxy);

module.exports = router;
