const morgan = require("morgan");
const { v4: uuidv4 } = require("uuid");
const logger = require("../utils/logger");

/**
 * Attach a unique request ID to every request so logs from
 * the gateway and downstream services can be correlated.
 */
const requestId = (req, res, next) => {
  const id = req.headers["x-request-id"] || uuidv4();
  req.requestId = id;
  res.setHeader("x-request-id", id);
  // Forward to downstream so they can include it in their own logs
  req.headers["x-request-id"] = id;
  next();
};

/**
 * HTTP access log in Apache combined-like format but piped
 * through Winston so everything ends up in the same log stream.
 */
const httpLogger = morgan(
  ":method :url :status :res[content-length] bytes - :response-time ms",
  {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
    // Skip health-check noise in production
    skip: (req) =>
      process.env.NODE_ENV === "production" && req.url === "/health",
  }
);

module.exports = { requestId, httpLogger };
