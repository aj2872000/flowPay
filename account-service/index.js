/**
 * Local development entry point.
 * On Vercel, api/index.js is used instead — this file is never called there.
 */
const http      = require("http");
const app       = require("./app");
const config    = require("./config");
const logger    = require("./utils/logger");

const start = async () => {
  // Only connect to DB for services that need it
  try {
    const connectDB = require("./config/database");
    await connectDB();
  } catch {
    // payment-simulator and api-gateway have no DB — ignore
  }

  const server = http.createServer(app);
  server.keepAliveTimeout = 65_000;
  server.headersTimeout   = 66_000;

  server.listen(config.port, () => {
    logger.info(`Service running on port ${config.port}`);
  });

  process.on("SIGTERM", () => server.close(() => process.exit(0)));
  process.on("SIGINT",  () => server.close(() => process.exit(0)));
};

start().catch((err) => {
  console.error("Startup failed:", err.message);
  process.exit(1);
});
