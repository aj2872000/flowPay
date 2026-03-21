const app       = require("./app");
const connectDB = require("./config/database");
const config    = require("./config");
const logger    = require("./utils/logger");

const start = async () => {
  await connectDB();

  const server = app.listen(config.port, () => {
    logger.info("✅ Auth Service running", {
      port:    config.port,
      env:     config.nodeEnv,
      mongoDb: config.mongo.uri,
    });
  });

  // ── Server timeouts ────────────────────────────────────────────────────────
  // Prevents "request aborted" on slow clients and Postman keep-alive issues.
  server.keepAliveTimeout = 65_000;   // must be > any proxy/LB idle timeout
  server.headersTimeout   = 66_000;   // must be > keepAliveTimeout
  server.timeout          = 60_000;   // individual request timeout (60s)

  // ── Graceful shutdown ──────────────────────────────────────────────────────
  const shutdown = (signal) => {
    logger.info(`${signal} received – shutting down`);
    server.close(async () => {
      const mongoose = require("mongoose");
      await mongoose.connection.close();
      logger.info("MongoDB connection closed");
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT",  () => shutdown("SIGINT"));

  process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled rejection", { reason });
  });

  process.on("uncaughtException", (err) => {
    logger.error("Uncaught exception", { error: err.message, stack: err.stack });
    process.exit(1);
  });
};

start();
