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

    // Artificial latency so the UI loading state is visible
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
      scenario,
      status: scenarioDef.status,
    });

    // Always return HTTP 200 — the payment status (succeeded/failed) lives in
    // the body. Returning 402 for a failed simulation causes axios to throw,
    // so the UI never receives the result object.
    return res.status(200).json({ success: true, data: result });
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
