/**
 * All available test scenarios with their full deterministic behaviour.
 *
 * Each scenario defines:
 *   status      – "succeeded" | "failed"
 *   retryable   – whether billing-service should schedule a retry
 *   message     – human-readable result description
 *   declineCode – machine-readable code (mirrors real gateway decline codes)
 *   httpStatus  – HTTP status the simulator returns to the caller
 */
const SCENARIOS = {
  // ── Happy path ────────────────────────────────────────────────────────────
  success: {
    status:     "succeeded",
    retryable:  false,
    message:    "Payment processed successfully",
    declineCode: null,
    httpStatus:  200,
  },

  // ── Soft declines (retryable – the card might work on a later attempt) ───
  insufficient_funds: {
    status:     "failed",
    retryable:  true,
    message:    "Payment failed: insufficient funds",
    declineCode: "insufficient_funds",
    httpStatus:  402,
  },

  network_error: {
    status:     "failed",
    retryable:  true,
    message:    "Payment failed: network timeout from card issuer",
    declineCode: "network_error",
    httpStatus:  402,
  },

  processing_error: {
    status:     "failed",
    retryable:  true,
    message:    "Payment failed: temporary processing error",
    declineCode: "processing_error",
    httpStatus:  402,
  },

  // ── Hard declines (not retryable – will always fail) ─────────────────────
  card_declined: {
    status:     "failed",
    retryable:  false,
    message:    "Payment failed: card declined by issuer",
    declineCode: "card_declined",
    httpStatus:  402,
  },

  fraud_detected: {
    status:     "failed",
    retryable:  false,
    message:    "Payment failed: transaction flagged as fraudulent",
    declineCode: "fraud_detected",
    httpStatus:  402,
  },

  card_expired: {
    status:     "failed",
    retryable:  false,
    message:    "Payment failed: card has expired",
    declineCode: "card_expired",
    httpStatus:  402,
  },

  invalid_cvv: {
    status:     "failed",
    retryable:  false,
    message:    "Payment failed: invalid CVV",
    declineCode: "invalid_cvv",
    httpStatus:  402,
  },

  stolen_card: {
    status:     "failed",
    retryable:  false,
    message:    "Payment failed: card reported stolen",
    declineCode: "stolen_card",
    httpStatus:  402,
  },
};

/**
 * Returns the scenario definition for the given key.
 * Falls back to "success" for unknown scenario names so billing-service
 * always gets a well-formed response.
 */
const getScenario = (scenarioKey) =>
  SCENARIOS[scenarioKey] ?? SCENARIOS.success;

/**
 * Public list for the GET /api/simulate/scenarios endpoint.
 * Strips the internal httpStatus field.
 */
const listScenarios = () =>
  Object.entries(SCENARIOS).map(([id, s]) => ({
    id,
    label:      s.message,
    status:     s.status,
    retryable:  s.retryable,
    declineCode: s.declineCode,
  }));

module.exports = { getScenario, listScenarios, SCENARIOS };
