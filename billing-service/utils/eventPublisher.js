const axios  = require("axios");
const config = require("../config");
const logger = require("./logger");

/**
 * Fire-and-forget: publish a domain event to the event-service.
 * Failures are logged but never throw — billing must not fail
 * because event publishing is unavailable.
 */
const publishEvent = async (type, payload, service = "billing-service") => {
  try {
    await axios.post(
      `${config.services.eventService}/internal/events`,
      { type, payload, service },
      { timeout: 5000 }
    );
    logger.debug("Event published", { type });
  } catch (err) {
    logger.error("Failed to publish event", { type, error: err.message });
  }
};

module.exports = { publishEvent };
