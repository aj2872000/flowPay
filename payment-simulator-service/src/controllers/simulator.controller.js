const { v4: uuidv4 }   = require("uuid");
const { getScenario, listScenarios } = require("../utils/scenarioEngine");
const config           = require("../config");
const logger           = require("../utils/logger");

// ── POST /api/simulate/charge ─────────────────────────────────────────────────
const charge = async (req, res, next) => {
  try {
    const {
      customer,
      amount,
      currency  = "USD",
      method    = "card_visa",
      scenario  = "success",
    } = req.body;

    // Simulate processing latency
    await new Promise((r) => setTimeout(r, config.simulator.processingDelayMs));

    const scenarioDef = getScenario(scenario);
    const paymentId   = `pay_sim_${uuidv4().replace(/-/g, "").slice(0, 12)}`;

    const result = {
      id:          paymentId,
      status:      scenarioDef.status,
      amount:      parseFloat(amount),
      currency,
      customer,
      method,
      scenario,
      retryable:   scenarioDef.retryable,
      declineCode: scenarioDef.declineCode,
      message:     scenarioDef.message,
      timestamp:   new Date().toISOString(),
    };

    logger.info("Charge simulated", {
      paymentId,
      customer,
      amount,
      currency,
      scenario,
      status: scenarioDef.status,
      caller: req.isInternal ? "internal-service" : req.user?.id,
    });

    return res.status(scenarioDef.httpStatus).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/simulate/scenarios ───────────────────────────────────────────────
const getScenarios = (req, res) => {
  return res.status(200).json({
    success: true,
    data: { scenarios: listScenarios() },
  });
};

module.exports = { charge, getScenarios };
