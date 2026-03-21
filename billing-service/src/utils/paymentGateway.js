const axios  = require("axios");
const config = require("../config");
const logger = require("./logger");

/**
 * Charge a customer by calling payment-simulator-service.
 * Returns { status: "succeeded"|"failed", id, message, retryable }
 */
const charge = async ({ customer, amount, currency = "USD", method = "card_visa", scenario = "success" }) => {
  try {
    const { data } = await axios.post(
      `${config.services.paymentSimulator}/api/simulate/charge`,
      { customer, amount, currency, method, scenario },
      { timeout: 10000 }
    );
    return data.data;
  } catch (err) {
    logger.error("Payment gateway call failed", { error: err.message });
    // Treat network errors as retryable failures
    return { status: "failed", retryable: true, message: "Gateway unreachable" };
  }
};

module.exports = { charge };
