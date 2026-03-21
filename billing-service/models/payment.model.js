const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription", index: true },
  customerId:     { type: String, required: true, index: true },
  customer:       { type: String, required: true },
  amount:         { type: Number, required: true },
  currency:       { type: String, default: "USD" },

  status: {
    type:  String,
    enum:  ["processing", "succeeded", "failed", "refunded"],
    default: "processing",
    index: true,
  },

  method:        { type: String, default: "card_visa" },
  failureReason: { type: String, default: null },

  // Retry tracking
  retries:        { type: Number, default: 0 },
  maxRetries:     { type: Number, default: 3 },
  nextRetryAt:    { type: Date,   default: null },
  lastAttemptAt:  { type: Date,   default: null },

  // Reference from payment-simulator
  simulatorRef: { type: String, default: null },

  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

paymentSchema.index({ status: 1, nextRetryAt: 1 });

const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment;
