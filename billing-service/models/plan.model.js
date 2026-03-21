const mongoose = require("mongoose");

const planSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  price:     { type: Number, required: true, min: 0 },      // in cents or whole USD — your choice
  currency:  { type: String, default: "USD" },
  interval:  { type: String, enum: ["month", "year"], default: "month" },
  features:  { type: [String], default: [] },
  isActive:  { type: Boolean, default: true },
  metadata:  { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

planSchema.index({ name: 1 });

const Plan = mongoose.model("Plan", planSchema);
module.exports = Plan;
