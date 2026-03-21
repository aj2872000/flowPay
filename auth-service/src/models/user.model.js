const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const config   = require("../config");

const userSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, "Name is required"],
      trim:     true,
      minlength: [2,  "Name must be at least 2 characters"],
      maxlength: [80, "Name must be at most 80 characters"],
    },

    email: {
      type:     String,
      required: [true, "Email is required"],
      unique:   true,
      lowercase: true,
      trim:     true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },

    password: {
      type:     String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select:   false, // never returned in queries by default
    },

    role: {
      type:    String,
      enum:    ["admin", "user"],
      default: "user",
    },

    isActive: {
      type:    Boolean,
      default: true,
    },

    // Store refresh tokens so we can invalidate individual sessions
    refreshTokens: {
      type:   [String],
      select: false,
    },

    lastLoginAt: {
      type: Date,
    },

    passwordChangedAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
    toJSON: {
      transform(_, ret) {
        delete ret.password;
        delete ret.refreshTokens;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
userSchema.index({ email: 1 }, { unique: true });

// ── Pre-save: hash password whenever it is modified ──────────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, config.bcrypt.saltRounds);
  this.passwordChangedAt = new Date();
  next();
});

// ── Instance method: compare plain-text password with stored hash ─────────────
userSchema.methods.comparePassword = async function (plainText) {
  return bcrypt.compare(plainText, this.password);
};

// ── Instance method: check whether JWT was issued before password was changed ─
userSchema.methods.passwordChangedAfter = function (jwtIssuedAt) {
  if (!this.passwordChangedAt) return false;
  return this.passwordChangedAt.getTime() / 1000 > jwtIssuedAt;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
