const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema({
  eventId:   { type: mongoose.Schema.Types.ObjectId, ref: "Event",   required: true, index: true },
  webhookId: { type: mongoose.Schema.Types.ObjectId, ref: "Webhook", required: true, index: true },

  url:     { type: String, required: true },
  attempt: { type: Number, default: 1 },

  status: {
    type:    String,
    enum:    ["pending", "delivered", "failed"],
    default: "pending",
    index:   true,
  },

  // HTTP response from the destination
  responseCode:    { type: Number,  default: null },
  responseTimeMs:  { type: Number,  default: null },
  responseBody:    { type: String,  default: null },
  errorMessage:    { type: String,  default: null },

  // Retry scheduling
  nextAttemptAt: { type: Date, default: null, index: true },

}, { timestamps: true });

const Delivery = mongoose.model("Delivery", deliverySchema);
module.exports = Delivery;
