require("dotenv").config();

const config = {
  port: parseInt(process.env.PORT, 10) || 8080,
  nodeEnv: process.env.NODE_ENV || "development",

  jwt: {
    secret: process.env.JWT_SECRET || "changeme_in_production",
    algorithm: process.env.JWT_ALGORITHM || "HS256",
  },

  services: {
    auth:      process.env.AUTH_SERVICE_URL      || "http://localhost:8081",
    account:   process.env.ACCOUNT_SERVICE_URL   || "http://localhost:8082",
    billing:   process.env.BILLING_SERVICE_URL   || "http://localhost:8083",
    event:     process.env.EVENT_SERVICE_URL      || "http://localhost:8084",
    simulator: process.env.PAYMENT_SIMULATOR_URL  || "http://localhost:8085",
  },

  rateLimit: {
    global: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60_000,
      max:      parseInt(process.env.RATE_LIMIT_MAX, 10)        || 100,
    },
    auth: {
      windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 10) || 900_000,
      max:      parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10)        || 20,
    },
  },

  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  },

  log: {
    level: process.env.LOG_LEVEL || "info",
  },
};

// Validate critical values at startup
if (config.nodeEnv === "production" && config.jwt.secret === "changeme_in_production") {
  throw new Error("JWT_SECRET must be set in production!");
}

module.exports = config;
