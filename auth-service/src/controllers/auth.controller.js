const User         = require("../models/user.model");
const RefreshToken = require("../models/refreshToken.model");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  expiryToDate,
} = require("../utils/jwt");
const config = require("../config");
const logger = require("../utils/logger");

// ─── Helper ───────────────────────────────────────────────────────────────────
/**
 * Persist a new refresh token document and return the signed string.
 */
const issueRefreshToken = async (user, meta = {}) => {
  const token     = signRefreshToken(user);
  const expiresAt = expiryToDate(config.refreshToken.expiresIn);

  await RefreshToken.create({
    userId:    user._id,
    token,
    expiresAt,
    userAgent: meta.userAgent || "",
    ip:        meta.ip        || "",
  });

  return token;
};

// ─── POST /api/auth/register ─────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check for duplicate email (Mongoose also enforces unique index,
    // but this gives a friendlier error before hitting the DB constraint)
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: { message: "An account with this email already exists" },
      });
    }

    const user = await User.create({ name, email, password });

    logger.info("User registered", { userId: user._id, email });

    return res.status(201).json({
      success: true,
      data: {
        id:        user._id,
        name:      user.name,
        email:     user.email,
        role:      user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Select password explicitly (it's excluded from queries by default)
    const user = await User.findOne({ email }).select("+password");

    // Use the same error for wrong email AND wrong password to prevent
    // user enumeration attacks
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        error: { message: "Invalid email or password" },
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: { message: "Account is deactivated – contact support" },
      });
    }

    // Issue tokens
    const accessToken  = signAccessToken(user);
    const refreshToken = await issueRefreshToken(user, {
      userAgent: req.headers["user-agent"],
      ip:        req.ip,
    });

    // Update last login timestamp (non-blocking)
    user.lastLoginAt = new Date();
    user.save().catch((e) => logger.error("Failed to update lastLoginAt", { error: e.message }));

    logger.info("User logged in", { userId: user._id, email });

    return res.status(200).json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        expiresIn: config.jwt.expiresIn,
        user: {
          id:    user._id,
          name:  user.name,
          email: user.email,
          role:  user.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/refresh ───────────────────────────────────────────────────
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    // Verify JWT signature and expiry
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      return res.status(401).json({
        success: false,
        error: { message: "Invalid or expired refresh token" },
      });
    }

    // Find the token document
    const tokenDoc = await RefreshToken.findOne({ token: refreshToken });

    if (!tokenDoc) {
      // Token not found — could be reuse of a rotated/deleted token.
      // Revoke ALL tokens for this user as a security measure.
      logger.warn("Refresh token reuse detected – revoking all tokens", {
        userId: payload.sub,
      });
      await RefreshToken.deleteMany({ userId: payload.sub });
      return res.status(401).json({
        success: false,
        error: { message: "Token reuse detected – please log in again" },
      });
    }

    if (tokenDoc.revoked) {
      return res.status(401).json({
        success: false,
        error: { message: "Refresh token has been revoked" },
      });
    }

    // Load the user
    const user = await User.findById(tokenDoc.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: { message: "User not found or deactivated" },
      });
    }

    // Rotate: delete the old token and issue a new one
    await RefreshToken.deleteOne({ _id: tokenDoc._id });
    const newAccessToken  = signAccessToken(user);
    const newRefreshToken = await issueRefreshToken(user, {
      userAgent: req.headers["user-agent"],
      ip:        req.ip,
    });

    logger.info("Tokens refreshed", { userId: user._id });

    return res.status(200).json({
      success: true,
      data: {
        accessToken:  newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn:    config.jwt.expiresIn,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    // Delete only this device's refresh token so other sessions stay active
    const result = await RefreshToken.deleteOne({ token: refreshToken });

    if (result.deletedCount === 0) {
      // Token wasn't found – already expired or already logged out.
      // Return 200 anyway so the client clears its storage.
      logger.debug("Logout: token not found (already expired?)", {
        userId: req.user?.id,
      });
    } else {
      logger.info("User logged out", { userId: req.user?.id });
    }

    return res.status(200).json({
      success: true,
      data: { message: "Logged out successfully" },
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/logout-all ────────────────────────────────────────────────
const logoutAll = async (req, res, next) => {
  try {
    // Revoke every refresh token for this user (all devices / sessions)
    await RefreshToken.deleteMany({ userId: req.user.id });

    logger.info("User logged out from all devices", { userId: req.user.id });

    return res.status(200).json({
      success: true,
      data: { message: "Logged out from all devices" },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: "User not found" },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id:          user._id,
        name:        user.name,
        email:       user.email,
        role:        user.role,
        isActive:    user.isActive,
        lastLoginAt: user.lastLoginAt,
        createdAt:   user.createdAt,
        updatedAt:   user.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, refresh, logout, logoutAll, me };
