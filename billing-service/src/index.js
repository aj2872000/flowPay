const app               = require("./app");
const connectDB         = require("./config/database");
const config            = require("./config");
const logger            = require("./utils/logger");
const { startRetryJob, stopRetryJob } = require("./jobs/retryJob");

const start = async () => {
  await connectDB();

  const server = app.listen(config.port, () => {
    logger.info("✅ Billing Service running", {
      port:    config.port,
      env:     config.nodeEnv,
      mongoDb: config.mongo.uri,
    });

  // Prevent "request aborted" errors from Postman keep-alive / slow clients
  server.keepAliveTimeout = 65_000;
  server.headersTimeout   = 66_000;
  server.timeout          = 60_000;
  });

  // Start the payment retry cron job
  startRetryJob();

  const shutdown = (signal) => {
    logger.info(`${signal} – shutting down billing service`);
    stopRetryJob();
    server.close(async () => {
      await require("mongoose").connection.close();
      logger.info("MongoDB connection closed");
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT",  () => shutdown("SIGINT"));
  process.on("unhandledRejection", (r) => logger.error("Unhandled rejection", { reason: r }));
  process.on("uncaughtException",  (e) => {
    logger.error("Uncaught exception", { error: e.message, stack: e.stack });
    process.exit(1);
  });
};

start();
