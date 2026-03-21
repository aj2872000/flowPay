require("dotenv").config();

const config = {
  port:    parseInt(process.env.PORT, 10) || 8082,
  nodeEnv: process.env.NODE_ENV || "development",
  mongo: {
    uri: process.env.MONGO_URI || "mongodb://localhost:27017/flowpay_accounts",
  },
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:8080",
  },
  log: {
    level: process.env.LOG_LEVEL || "info",
  },
};

module.exports = config;
