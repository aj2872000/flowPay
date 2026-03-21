require("dotenv").config();

const config = {
  port:    parseInt(process.env.PORT, 10) || 8085,
  nodeEnv: process.env.NODE_ENV || "development",

  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:8080",
  },

  simulator: {
    // Artificial delay so the UI loading state is visible during demos
    processingDelayMs: parseInt(process.env.PROCESSING_DELAY_MS, 10) || 400,
  },

  log: {
    level: process.env.LOG_LEVEL || "info",
  },
};

module.exports = config;
