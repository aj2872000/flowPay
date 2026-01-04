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
  await createEvent({...event, event_type : "RECEIVED"});

  // 3. Dispatch asynchronously (fire-and-forget)
  dispatchToBilling(event).catch(err => {
    console.error("Billing dispatch failed", event.id, err.message);
  });

  return { processed: true };
};

async function dispatchToBilling(event, retries = 3) {
  try {
    await axios.post(
      `${BILLING_SERVICE_URL}/internal/events`,
      {
        eventId: event.id,
        type: event.event_type,
        payload: event.payload
      },
      { timeout: 3000 }
    );

    await markProcessed(event.id, "DISPATCHED");

  } catch (err) {
    // if (retries > 0) {
    //   await new Promise(r => setTimeout(r, 2000));
    //   return dispatchToBilling(event, retries - 1);
    // }

    await markProcessed(event.id, "FAILED");
    throw err;
  }
}

module.exports = { processEvent };
