const Event    = require("../models/event.model");
const logger   = require("../utils/logger");
const { fanOutEvent } = require("../utils/webhookDelivery");

// GET /api/events/events
const listEvents = async (req, res, next) => {
  try {
    const { type, service, status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (type)    query.type    = type;
    if (service) query.service = service;
    if (status)  query.status  = status;

    const [data, total] = await Promise.all([
      Event.find(query)
        .sort({ createdAt: -1 })
        .skip((+page - 1) * +limit)
        .limit(+limit)
        .lean(),
      Event.countDocuments(query),
    ]);

    return res.status(200).json({ success: true, data: { data, total, page: +page, limit: +limit } });
  } catch (err) { next(err); }
};

// GET /api/events/events/:id
const getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, error: { message: "Event not found" } });
    }
    return res.status(200).json({ success: true, data: event });
  } catch (err) { next(err); }
};

// POST /internal/events  – called by billing-service / account-service (no auth token)
const publishEvent = async (req, res, next) => {
  try {
    const { type, payload, service } = req.body;

    if (!type || !service) {
      return res.status(422).json({
        success: false,
        error: { message: "type and service are required" },
      });
    }

    const event = await Event.create({ type, payload: payload || {}, service });
    logger.info("Event received", { eventId: event._id, type, service });

    // Fan-out to webhooks asynchronously — don't block the caller
    setImmediate(() => fanOutEvent(event).catch((e) =>
      logger.error("Fan-out error", { eventId: event._id, error: e.message })
    ));

    return res.status(201).json({ success: true, data: { id: event._id, type, status: "pending" } });
  } catch (err) { next(err); }
};

module.exports = { listEvents, getEvent, publishEvent };
