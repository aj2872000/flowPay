const mongoose = require("mongoose");
const crypto   = require("crypto");

const webhookSchema = new mongoose.Schema({
  // Owner of this webhook registration
  userId: { type: String, required: true, index: true },

  url: {
    type:     String,
    required: true,
    trim:     true,
  },

  // Array of event types to deliver e.g. ["payment.succeeded","payment.failed"]
  events: {
    type:    [String],
    default: [],
  },

  status: {
    type:    String,
    enum:    ["active", "disabled", "failing"],
    default: "active",
    index:   true,
  },

  // HMAC-SHA256 signing secret — stored but never returned in API responses
  secret: {
    type:   String,
    select: false,
  },

  // Running stats
  totalDeliveries:    { type: Number, default: 0 },
  successfulDeliveries:{ type: Number, default: 0 },
  lastDeliveryAt:     { type: Date,   default: null },
  lastDeliveryStatus: { type: String, default: null },

  // If >N consecutive failures, mark as "failing"
  consecutiveFailures: { type: Number, default: 0 },

}, { timestamps: true });

// Virtual: success rate percentage
webhookSchema.virtual("successRate").get(function () {
  if (this.totalDeliveries === 0) return 100;
  return +((this.successfulDeliveries / this.totalDeliveries) * 100).toFixed(1);
});

webhookSchema.set("toJSON", { virtuals: true });
webhookSchema.set("toObject", { virtuals: true });

// Generate a signing secret on creation if not provided
webhookSchema.pre("save", function (next) {
  if (!this.secret) {
    this.secret = "whsec_" + crypto.randomBytes(24).toString("hex");
  }
  next();
});

const Webhook = mongoose.model("Webhook", webhookSchema);
module.exports = Webhook;
