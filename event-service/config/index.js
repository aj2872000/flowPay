require("dotenv").config();

const config = {
  port:    parseInt(process.env.PORT, 10) || 8084,
  nodeEnv: process.env.NODE_ENV || "development",

  mongo: {
    uri: process.env.MONGO_URI || "mongodb://localhost:27017/flowpay_events",
  },

  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:8080",
  },

  webhook: {
    timeoutMs:   parseInt(process.env.WEBHOOK_TIMEOUT_MS, 10)  || 5000,
    maxAttempts: parseInt(process.env.WEBHOOK_MAX_ATTEMPTS, 10) || 5,
    retryCron:   process.env.WEBHOOK_RETRY_CRON || "*/2 * * * *",
  },

  log: {
    level: process.env.LOG_LEVEL || "info",
  },
};

module.exports = config;
