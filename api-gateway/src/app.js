const express = require("express");
const helmet  = require("helmet");
const cors    = require("cors");

const config         = require("./config");
const { requestId, httpLogger } = require("./middleware/logger");
const { globalLimiter }         = require("./middleware/rateLimiter");
const { notFound, errorHandler }= require("./middleware/errorHandler");

const healthRoutes    = require("./routes/health.routes");
const authRoutes      = require("./routes/auth.routes");
const accountRoutes   = require("./routes/account.routes");
const billingRoutes   = require("./routes/billing.routes");
const eventRoutes     = require("./routes/event.routes");
const simulatorRoutes = require("./routes/simulator.routes");

const app = express();

// ─── Trust Railway's reverse proxy ───────────────────────────────────────────
// Railway sits behind a load balancer. Without this, req.ip is always the
// internal proxy IP, which breaks rate limiting and IP-based logic.
app.set("trust proxy", 1);

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy:   false,
}));

// ─── CORS — must be first, before every other middleware ─────────────────────
const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    if (config.nodeEnv !== "production") return cb(null, true);

    const rawOrigin = config.cors.origin || "";
    const allowList = rawOrigin.split(",").map((o) => o.trim()).filter(Boolean);

    if (
      origin.endsWith(".vercel.app") ||
      origin.includes("localhost") ||
      origin.includes("127.0.0.1") ||
      allowList.includes(origin)
    ) return cb(null, true);

    cb(new Error(`CORS: "${origin}" not allowed`));
  },
  credentials:          true,
  methods:              ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders:       ["Content-Type", "Authorization", "x-request-id"],
  exposedHeaders:       ["x-request-id", "RateLimit-Limit", "RateLimit-Remaining"],
  optionsSuccessStatus: 200,
  maxAge:               86400,
};

app.use(cors(corsOptions));

// Short-circuit ALL OPTIONS preflights — must be above every route
app.options("*", (req, res) => {
  res.set({
    "Access-Control-Allow-Origin":  req.headers.origin || "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization,x-request-id",
    "Access-Control-Max-Age":       "86400",
  });
  res.status(200).end();
});

// ─── Keep-alive ───────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader("Connection", "keep-alive");
  next();
});

// ─── Request enrichment ───────────────────────────────────────────────────────
app.use(requestId);
app.use(httpLogger);

// ─── Rate limiting ────────────────────────────────────────────────────────────
app.use(globalLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/health",        healthRoutes);
app.use("/api/auth",      authRoutes);
app.use("/api/accounts",  accountRoutes);
app.use("/api/billing",   billingRoutes);
app.use("/api/events",    eventRoutes);
app.use("/api/simulator", simulatorRoutes);

// ─── Fallback & errors ────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
