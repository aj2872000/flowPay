const axios  = require("axios");
const config = require("../config");
const logger = require("./logger");

/**
 * Charge a customer by calling payment-simulator-service.
 * Returns { status: "succeeded"|"failed", id, message, retryable }
 */
const charge = async ({ customer, amount, currency = "USD", method = "card_visa", scenario = "success" }) => {
  const url = `${config.services.paymentSimulator}/api/simulator/charge`;
  logger.debug("Calling payment simulator", { url, customer, amount, scenario });

  try {
    const { data } = await axios.post(
      url,
      { customer, amount, currency, method, scenario },
      {
        timeout: 15000,
        headers: {
          // Tells the simulator this is a trusted internal service call,
          // bypassing JWT authentication (see simulator/src/middleware/auth.js)
          "x-internal-service": "billing-service",
          "Content-Type":       "application/json",
        },
      }
    );
    logger.debug("Simulator response", { status: data?.data?.status });
    return data.data;
  } catch (err) {
    const status  = err.response?.status;
    const message = err.response?.data?.error?.message || err.message;
    logger.error("Payment simulator call failed", {
      url,
      status,
      error: message,
      code:  err.code,
    });
    // Distinguish between simulator being down (retryable) vs a hard error
    if (err.code === "ECONNREFUSED" || err.code === "ECONNRESET" || err.code === "ETIMEDOUT") {
      return { status: "failed", retryable: true,  message: "Payment simulator unreachable — will retry" };
    }
    return { status: "failed", retryable: false, message: `Simulator error: ${message}` };
  }
};

module.exports = { charge };
