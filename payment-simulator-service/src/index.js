const app    = require("./app");
const config = require("./config");
const logger = require("./utils/logger");

const server = app.listen(config.port, () => {
  logger.info("✅ Payment Simulator running", {
    port:    config.port,
    env:     config.nodeEnv,
    delayMs: config.simulator.processingDelayMs,
  });

  // Prevent "request aborted" errors from Postman keep-alive / slow clients
  server.keepAliveTimeout = 65_000;
  server.headersTimeout   = 66_000;
  server.timeout          = 60_000;
});

const shutdown = (signal) => {
  logger.info(`${signal} – shutting down payment simulator`);
  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));
process.on("unhandledRejection", (r) =>
  logger.error("Unhandled rejection", { reason: r })
);
process.on("uncaughtException", (e) => {
  logger.error("Uncaught exception", { error: e.message, stack: e.stack });
  process.exit(1);
});
