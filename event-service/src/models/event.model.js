const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  // e.g. "payment.succeeded", "subscription.canceled"
  type: {
    type:     String,
    required: true,
    index:    true,
  },

  // Which microservice emitted this event
  service: {
    type:    String,
    required: true,
  },

  // Arbitrary JSON payload from the emitting service
  payload: {
    type:    mongoose.Schema.Types.Mixed,
    default: {},
  },

  // Overall delivery status across all webhooks
  status: {
    type:    String,
    enum:    ["pending", "delivered", "failed", "partial"],
    default: "pending",
    index:   true,
  },

  // How many webhook endpoints successfully received this event
  deliveredCount: { type: Number, default: 0 },
  failedCount:    { type: Number, default: 0 },

}, {
  timestamps: true,
  // Events are immutable — disable update operations
  strict: true,
});

eventSchema.index({ createdAt: -1 });
eventSchema.index({ type: 1, createdAt: -1 });

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
