const { Router }   = require("express");
const { authenticate }              = require("../middleware/auth");
const { validate, chargeRules }     = require("../middleware/validate");
const { charge, getScenarios }      = require("../controllers/simulator.controller");

const router = Router();

// Both routes require authentication (user token or internal service header)
router.use(authenticate);

/**
 * GET /api/simulate/scenarios
 * Returns all available test scenarios with their labels and retryable flags.
 * Used by the UI's Simulator page to populate the scenario selector.
 */
router.get("/scenarios", getScenarios);

/**
 * POST /api/simulate/charge
 * Body: { customer, amount, currency?, method?, scenario? }
 * Returns a deterministic payment result based on the chosen scenario.
 *
 * Called by:
 *   – billing-service (internally, with x-internal-service header)
 *   – flow-pay-ui via the api-gateway (with JWT)
 */
router.post("/charge", chargeRules, validate, charge);

module.exports = router;
