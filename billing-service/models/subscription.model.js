const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  customerId:   { type: String, required: true, index: true },
  customer:     { type: String, required: true },
  email:        { type: String, required: true, lowercase: true },
  planId:       { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true },
  planName:     { type: String },   // denormalised for fast reads
  amount:       { type: Number, required: true },
  currency:     { type: String, default: "USD" },

  status: {
    type:    String,
    enum:    ["trialing", "active", "past_due", "canceled", "paused"],
    default: "active",
    index:   true,
  },

  // Billing cycle
  currentPeriodStart: { type: Date, default: Date.now },
  currentPeriodEnd:   { type: Date },
  nextBillingDate:    { type: Date },

  // Trial
  trialEndsAt: { type: Date, default: null },

  // Cancellation
  canceledAt:  { type: Date, default: null },
  cancelReason:{ type: String, default: null },
  endsAt:      { type: Date, default: null },   // when access expires after cancel

  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

subscriptionSchema.index({ status: 1, nextBillingDate: 1 });

const Subscription = mongoose.model("Subscription", subscriptionSchema);
module.exports = Subscription;
