require("dotenv").config();

const config = {
  port:    parseInt(process.env.PORT, 10) || 8083,
  nodeEnv: process.env.NODE_ENV || "development",

  mongo: {
    uri: process.env.MONGO_URI || "mongodb://localhost:27017/flowpay_billing",
  },

  services: {
    paymentSimulator: process.env.PAYMENT_SIMULATOR_URL || "http://localhost:8085",
    eventService:     process.env.EVENT_SERVICE_URL     || "http://localhost:8084",
  },

  retry: {
    maxAttempts:    parseInt(process.env.MAX_PAYMENT_RETRIES, 10) || 3,
    delayMinutes:   parseInt(process.env.RETRY_DELAY_MINUTES, 10) || 60,
    cronSchedule:   process.env.RETRY_CRON_SCHEDULE || "*/5 * * * *",
  },

  trial: {
    defaultDays: parseInt(process.env.DEFAULT_TRIAL_DAYS, 10) || 14,
  },

  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:8080",
  },

  log: {
    level: process.env.LOG_LEVEL || "info",
  },
};

module.exports = config;
