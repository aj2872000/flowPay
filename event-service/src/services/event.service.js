const axios = require("axios");
const {
  createEvent,
  eventExists,
  markProcessed
} = require("../models/event.model");

// const BILLING_SERVICE_URL = process.env.BILLING_SERVICE_URL 

const processEvent = async (event) => {
  // 1. Deduplication
  const exists = await eventExists(event.id);
  if (exists) {
    return { ignored: true };
  }

  // 2. Store audit log
  await createEvent(event);

  // 3. Notify Billing Service
  // await axios.post(`${BILLING_SERVICE_URL}/internal/events`, {
  //   eventId: event.id,
  //   type: event.event_type,
  //   payload: event.payload
  // });

  // 4. Mark processed
  await markProcessed(event.id);

  return { processed: true };
};

module.exports = { processEvent };
