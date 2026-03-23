const logger = require("../utils/logger");

const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    error: { message: `Route not found: ${req.method} ${req.originalUrl}` },
  });
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;

  logger.error("Unhandled error", {
    message:   err.message,
    stack:     err.stack,
    requestId: req.requestId,
    method:    req.method,
    path:      req.originalUrl,
  });

  if (res.headersSent) return;

  // Always return the real message — hiding it as "Internal server error"
  // makes debugging impossible. Add HIDE_ERRORS=true env var when you want
  // to suppress messages in production.
  const hideMessage =
    process.env.HIDE_ERRORS === "true" && statusCode === 500;

  res.status(statusCode).json({
    success: false,
    error: {
      message: hideMessage ? "Internal server error" : err.message,
      ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    },
  });
};

module.exports = { notFound, errorHandler };
