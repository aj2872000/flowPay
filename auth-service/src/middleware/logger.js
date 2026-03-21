const morgan = require("morgan");
const { v4: uuidv4 } = require("uuid");
const logger = require("../utils/logger");

const requestId = (req, res, next) => {
  const id = req.headers["x-request-id"] || uuidv4();
  req.requestId = id;
  res.setHeader("x-request-id", id);
  next();
};

const httpLogger = morgan(
  ":method :url :status :res[content-length] bytes - :response-time ms",
  {
    stream: { write: (msg) => logger.http(msg.trim()) },
    skip:   (req) => process.env.NODE_ENV === "production" && req.url === "/health",
  }
);

module.exports = { requestId, httpLogger };
