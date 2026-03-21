const express  = require("express");
const helmet   = require("helmet");
const cors     = require("cors");
const morgan   = require("morgan");
const { v4: uuidv4 } = require("uuid");
const config   = require("./config");
const logger   = require("./utils/logger");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const healthRoutes  = require("./routes/health.routes");
const billingRoutes = require("./routes/billing.routes");

const app = express();
app.use(helmet());
app.use(cors({ origin: config.cors.origin, credentials: true }));

app.use((req, res, next) => {
  req.requestId = req.headers["x-request-id"] || uuidv4();
  res.setHeader("x-request-id", req.requestId);
  next();
});

app.use(morgan(":method :url :status - :response-time ms", {
  stream: { write: (m) => logger.http(m.trim()) },
}));
app.use(express.json({ limit: "512kb" }));

app.use("/health",       healthRoutes);
app.use("/api/billing",  billingRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
