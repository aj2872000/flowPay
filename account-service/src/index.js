const app       = require("./app");
const connectDB = require("./config/database");
const config    = require("./config");
const logger    = require("./utils/logger");

const start = async () => {
  await connectDB();
  const server = app.listen(config.port, () =>
    logger.info("✅ Account Service running", { port: config.port, env: config.nodeEnv })
  );
  const shutdown = (sig) => {
    logger.info(`${sig} – shutting down`);
    server.close(async () => {
      await require("mongoose").connection.close();
      process.exit(0);
    });

  // Prevent "request aborted" errors during shutdown by telling clients to retry after 1 minute, and
  server.keepAliveTimeout = 65_000;
  server.headersTimeout   = 66_000;
  server.timeout          = 60_000;
    setTimeout(() => process.exit(1), 10_000);
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT",  () => shutdown("SIGINT"));
  process.on("unhandledRejection", (r) => logger.error("Unhandled rejection", { reason: r }));
};

start();
