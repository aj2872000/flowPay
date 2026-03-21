const Account = require("../models/account.model");
const logger  = require("../utils/logger");

// ── Helper: find or create account for logged-in user ────────────────────────
const getOrCreate = async (user) => {
  let account = await Account.findOne({ userId: user.id });
  if (!account) {
    // Auto-provision on first access (account was created in auth-service)
    account = await Account.create({
      userId: user.id,
      name:   user.name || user.email.split("@")[0],
      email:  user.email,
      role:   user.role || "user",
    });
    // Seed one live and one test API key on first provision
    const live = Account.generateApiKey("live");
    const test = Account.generateApiKey("test");
    account.apiKeys.push(
      { type: "live", keyHash: live.hash, prefix: live.prefix, last4: live.last4 },
      { type: "test", keyHash: test.hash, prefix: test.prefix, last4: test.last4 }
    );
    await account.save();
    logger.info("Account provisioned", { userId: user.id });
  }
  return account;
};

// ── GET /api/accounts/profile ────────────────────────────────────────────────
const getProfile = async (req, res, next) => {
  try {
    const account = await getOrCreate(req.user);
    return res.status(200).json({
      success: true,
      data: {
        id:            account.userId,
        name:          account.name,
        email:         account.email,
        role:          account.role,
        notifications: account.notifications,
        createdAt:     account.createdAt,
        updatedAt:     account.updatedAt,
      },
    });
  } catch (err) { next(err); }
};

// ── PATCH /api/accounts/profile ───────────────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const account = await getOrCreate(req.user);

    if (name)  account.name  = name;
    if (email) account.email = email;
    await account.save();

    logger.info("Profile updated", { userId: req.user.id });
    return res.status(200).json({
      success: true,
      data: {
        id:        account.userId,
        name:      account.name,
        email:     account.email,
        updatedAt: account.updatedAt,
      },
    });
  } catch (err) { next(err); }
};

// ── GET /api/accounts/api-keys ────────────────────────────────────────────────
const getApiKeys = async (req, res, next) => {
  try {
    const account = await getOrCreate(req.user);
    const keys = account.apiKeys.map((k) => ({
      id:        k._id,
      type:      k.type,
      prefix:    k.prefix,
      last4:     k.last4,
      createdAt: k.createdAt,
    }));
    return res.status(200).json({ success: true, data: { keys } });
  } catch (err) { next(err); }
};

// ── POST /api/accounts/api-keys/rotate ───────────────────────────────────────
const rotateApiKey = async (req, res, next) => {
  try {
    const { keyId } = req.body;
    const account   = await getOrCreate(req.user);

    const existing = account.apiKeys.id(keyId);
    if (!existing) {
      return res.status(404).json({ success: false, error: { message: "API key not found" } });
    }

    const generated = Account.generateApiKey(existing.type);
    // Replace the old key in the array
    existing.keyHash   = generated.hash;
    existing.prefix    = generated.prefix;
    existing.last4     = generated.last4;
    existing.createdAt = new Date();
    await account.save();

    logger.info("API key rotated", { userId: req.user.id, keyId });

    return res.status(200).json({
      success: true,
      data: {
        id:        existing._id,
        type:      existing.type,
        // Raw secret returned ONCE – never stored in plain text
        secret:    generated.raw,
        createdAt: existing.createdAt,
      },
    });
  } catch (err) { next(err); }
};

// ── PATCH /api/accounts/notifications ────────────────────────────────────────
const updateNotifications = async (req, res, next) => {
  try {
    const account = await getOrCreate(req.user);
    Object.assign(account.notifications, req.body);
    await account.save();

    return res.status(200).json({
      success: true,
      data: { notifications: account.notifications },
    });
  } catch (err) { next(err); }
};

// ── DELETE /api/accounts/account ─────────────────────────────────────────────
const deleteAccount = async (req, res, next) => {
  try {
    await Account.deleteOne({ userId: req.user.id });
    logger.info("Account deleted", { userId: req.user.id });
    return res.status(200).json({ success: true, data: { message: "Account deleted successfully" } });
  } catch (err) { next(err); }
};

module.exports = { getProfile, updateProfile, getApiKeys, rotateApiKey, updateNotifications, deleteAccount };
