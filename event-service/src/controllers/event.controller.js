const { v4: uuidv4 } = require("uuid");
const { processEvent } = require("../services/event.service");

const receiveEvent = async (req, res) => {
  try {
    const event = {
      id: req.body.id || uuidv4(),
      event_type: req.body.status,
      source: req.body.source || "payment-service",
      payload: req.body
    };

    const result = await processEvent(event);

    if (result.ignored) {
      return res.status(200).json({
        message: "Duplicate event ignored"
      });
    }

    res.status(201).json({
      message: "Event processed successfully",
      eventId: event.id
    });
  } catch (err) {
    console.error("Event processing failed", err);
    res.status(500).json({ error: "Event processing failed" });
  }
};

module.exports = { receiveEvent };
