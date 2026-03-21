const mongoose = require("mongoose");

/**
 * Stores each issued refresh token so we can:
 *  - Invalidate a single session on logout
 *  - Detect reuse of a stolen/rotated token (refresh-token rotation)
 *  - Let MongoDB auto-expire them via the TTL index on `expiresAt`
 */
const refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
      index:    true,
    },

    token: {
      type:     String,
      required: true,
      unique:   true,
    },

    // MongoDB TTL index – document is automatically deleted after this date
    expiresAt: {
      type:     Date,
      required: true,
    },

    // Track origin for audit purposes
    userAgent: String,
    ip:        String,

    revoked: {
      type:    Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// TTL index – MongoDB removes the document once expiresAt passes
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);

module.exports = RefreshToken;
