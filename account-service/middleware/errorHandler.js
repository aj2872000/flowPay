const logger = require("../utils/logger");

const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    error: { message: `Route not found: ${req.method} ${req.originalUrl}` },
  });
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Request aborted by client (Postman cancel, network drop, keep-alive close)
  if (
    err.type === "request.aborted" ||
    err.message === "request aborted" ||
    err.code === "ECONNRESET" ||
    (err.status === 400 && err.message && err.message.includes("aborted"))
  ) {
    logger.warn("Request aborted by client", { method: req.method, path: req.originalUrl });
    if (!res.headersSent) {
      res.status(400).json({ success: false, error: { message: "Request aborted" } });
    }
    return;
  }

  const statusCode = err.statusCode || err.status || 500;
  logger.error("Unhandled error", { message: err.message, stack: err.stack, method: req.method, path: req.originalUrl });

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res.status(409).json({ success: false, error: { message: `${field} already exists` } });
  }

  if (err.name === "ValidationError") {
    const details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    return res.status(422).json({ success: false, error: { message: "Validation failed", details } });
  }

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ success: false, error: { message: "Invalid JSON in request body" } });
  }

  if (err.type === "entity.too.large") {
    return res.status(413).json({ success: false, error: { message: "Request body too large" } });
  }

  if (res.headersSent) return;

  const body = {
    success: false,
    error: {
      message: process.env.NODE_ENV === "production" && statusCode === 500
        ? "Internal server error"
        : err.message,
    },
  };

  if (process.env.NODE_ENV !== "production") body.error.stack = err.stack;
  res.status(statusCode).json(body);
};

module.exports = { notFound, errorHandler };
