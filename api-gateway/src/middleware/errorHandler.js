const logger = require("../utils/logger");

/**
 * 404 handler – registered after all routes so any unmatched
 * path ends up here instead of crashing.
 */
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    },
  });
};

/**
 * Global error handler – always the last middleware registered.
 * Express recognises it by the 4-argument signature (err, req, res, next).
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;

  logger.error("Unhandled error", {
    message: err.message,
    stack: err.stack,
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl,
  });

  // Don't leak stack traces to clients in production
  const body = {
    success: false,
    error: {
      message:
        process.env.NODE_ENV === "production" && statusCode === 500
          ? "Internal server error"
          : err.message,
    },
  };

  if (process.env.NODE_ENV !== "production") {
    body.error.stack = err.stack;
  }

  res.status(statusCode).json(body);
};

module.exports = { notFound, errorHandler };
