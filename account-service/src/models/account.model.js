const mongoose = require("mongoose");
const crypto   = require("crypto");

const apiKeySchema = new mongoose.Schema({
  type:      { type: String, enum: ["live", "test"], required: true },
  keyHash:   { type: String, required: true, select: false },
  prefix:    { type: String, required: true },   
  last4:     { type: String, required: true },   
  createdAt: { type: Date,   default: Date.now },
}, { _id: true });

const notificationsSchema = new mongoose.Schema({
  paymentFailures:  { type: Boolean, default: true  },
  newSubscriptions: { type: Boolean, default: true  },
  trialEndings:     { type: Boolean, default: true  },
  webhookErrors:    { type: Boolean, default: false },
  monthlyReports:   { type: Boolean, default: true  },
}, { _id: false });

const accountSchema = new mongoose.Schema({
  // userId mirrors the _id from auth-service so we can look up by it
  userId: {
    type:     String,
    required: true,
    unique:   true,
    index:    true,
  },
  name:  { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  role:  { type: String, enum: ["admin", "user"], default: "user" },

  apiKeys:       { type: [apiKeySchema], default: [] },
  notifications: { type: notificationsSchema, default: () => ({}) },
}, { timestamps: true });

// ── Static: generate a raw API key + its stored hash ─────────────────────────
accountSchema.statics.generateApiKey = function (type = "live") {
  const prefix = type === "live" ? "sk_live_" : "sk_test_";
  const raw    = prefix + crypto.randomBytes(24).toString("hex");
  const last4  = raw.slice(-4);
  const hash   = crypto.createHash("sha256").update(raw).digest("hex");
  return { raw, hash, prefix, last4 };
};

const Account = mongoose.model("Account", accountSchema);
module.exports = Account;
