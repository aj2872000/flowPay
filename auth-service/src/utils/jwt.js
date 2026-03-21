const jwt    = require("jsonwebtoken");
const config = require("../config");

/**
 * Sign a short-lived access token.
 * Payload contains just enough for the gateway / services to identify the user.
 */
const signAccessToken = (user) =>
  jwt.sign(
    {
      sub:   user._id.toString(),
      id:    user._id.toString(),
      email: user.email,
      role:  user.role,
    },
    config.jwt.secret,
    {
      algorithm: config.jwt.algorithm,
      expiresIn: config.jwt.expiresIn,
    }
  );

/**
 * Sign a long-lived refresh token.
 * Minimal payload – only used to issue a new access token.
 */
const signRefreshToken = (user) =>
  jwt.sign(
    { sub: user._id.toString() },
    config.refreshToken.secret,
    { expiresIn: config.refreshToken.expiresIn }
  );

/**
 * Verify a refresh token and return its decoded payload.
 * Throws if invalid or expired.
 */
const verifyRefreshToken = (token) =>
  jwt.verify(token, config.refreshToken.secret);

/**
 * Convert a JWT expiry string (e.g. "7d", "1h") to a JS Date
 * so we can store it in MongoDB.
 */
const expiryToDate = (expiresIn) => {
  const units = { s: 1, m: 60, h: 3600, d: 86400 };
  const match  = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error(`Invalid expiresIn format: ${expiresIn}`);
  const seconds = parseInt(match[1], 10) * (units[match[2]] || 1);
  return new Date(Date.now() + seconds * 1000);
};

module.exports = { signAccessToken, signRefreshToken, verifyRefreshToken, expiryToDate };
