const http   = require("http");
const app    = require("./app");
const config = require("./config");
const logger = require("./utils/logger");

const server = http.createServer(app);

server.keepAliveTimeout = 65_000;
server.headersTimeout   = 66_000;
server.requestTimeout   = 120_000; // 2 min — gateway needs time for upstream calls

server.listen(config.port, () => {
  logger.info("✅ API Gateway running", {
    port:     config.port,
    env:      config.nodeEnv,
    services: config.services,
  });
});

const shutdown = (signal) => {
  logger.info(`${signal} – shutting down api-gateway`);
  server.close((err) => {
    if (err) { logger.error("Error during shutdown", { error: err.message }); process.exit(1); }
    logger.info("Server closed");
    process.exit(0);
  });
  setTimeout(() => { logger.error("Forced shutdown after timeout"); process.exit(1); }, 10_000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));
process.on("unhandledRejection", (reason) => logger.error("Unhandled promise rejection", { reason }));
process.on("uncaughtException",  (err)    => { logger.error("Uncaught exception", { error: err.message, stack: err.stack }); process.exit(1); });
