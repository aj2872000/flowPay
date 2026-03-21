const mongoose = require("mongoose");
const config   = require("./index");
const logger   = require("../utils/logger");

const connectDB = async (retries = 5) => {
  try {
    await mongoose.connect(config.mongo.uri, { serverSelectionTimeoutMS: 5000 });
    logger.info("MongoDB connected", { uri: config.mongo.uri });
  } catch (err) {
    if (retries > 0) {
      logger.warn(`MongoDB retry in 3s`, { retriesLeft: retries - 1, error: err.message });
      await new Promise((r) => setTimeout(r, 3000));
      return connectDB(retries - 1);
    }
    logger.error("MongoDB connection failed"); process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => logger.warn("MongoDB disconnected"));
mongoose.connection.on("reconnected",  () => logger.info("MongoDB reconnected"));

module.exports = connectDB;
