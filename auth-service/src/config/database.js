const mongoose = require("mongoose");
const config   = require("./index");
const logger   = require("../utils/logger");

const MAX_RETRIES  = 5;
const RETRY_DELAY  = 3000; // ms

const connectDB = async (retries = MAX_RETRIES) => {
  try {
    await mongoose.connect(config.mongo.uri, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info("MongoDB connected", { uri: config.mongo.uri });
  } catch (err) {
    if (retries > 0) {
      logger.warn(`MongoDB connection failed – retrying in ${RETRY_DELAY / 1000}s`, {
        retriesLeft: retries - 1,
        error: err.message,
      });
      await new Promise((r) => setTimeout(r, RETRY_DELAY));
      return connectDB(retries - 1);
    }
    logger.error("MongoDB connection failed after max retries", { error: err.message });
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () =>
  logger.warn("MongoDB disconnected")
);
mongoose.connection.on("reconnected", () =>
  logger.info("MongoDB reconnected")
);

module.exports = connectDB;
