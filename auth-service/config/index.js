require("dotenv").config();

const config = {
  port:    parseInt(process.env.PORT, 10) || 8081,
  nodeEnv: process.env.NODE_ENV || "development",

  mongo: {
    uri: process.env.MONGO_URI || "mongodb://localhost:27017/flowpay_auth",
  },

  jwt: {
    secret:     process.env.JWT_SECRET     || "changeme_in_production",
    algorithm:  process.env.JWT_ALGORITHM  || "HS256",
    expiresIn:  process.env.JWT_EXPIRES_IN || "1h",
  },

  refreshToken: {
    secret:    process.env.REFRESH_TOKEN_SECRET     || "refresh_changeme_in_production",
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
  },

  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12,
  },

  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:8080",
  },

  log: {
    level: process.env.LOG_LEVEL || "info",
  },
};

if (
  config.nodeEnv === "production" &&
  (config.jwt.secret === "changeme_in_production" ||
    config.refreshToken.secret === "refresh_changeme_in_production")
) {
  throw new Error("JWT_SECRET and REFRESH_TOKEN_SECRET must be set in production!");
}

module.exports = config;
