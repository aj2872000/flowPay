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
app.set("trust proxy", 1);// ─── RAW DEBUG — prints every request before anything else ───────────────────
// Uses console.log directly — guaranteed to appear in Railway logs
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.originalUrl} origin=${req.headers.origin || "none"}`);
  const origJson = res.json.bind(res);
  res.json = (body) => {
    console.log(`[RESPONSE] ${req.method} ${req.originalUrl} status=${res.statusCode}`, JSON.stringify(body).slice(0, 300));
    return origJson(body);
  };
  next();
});

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy:   false,
}));

// ─── CORS — must be first, before every other middleware ─────────────────────
const corsOptions = {
  origin(origin, cb) {
    console.log(`[CORS] origin=${origin || "none"} env=${config.nodeEnv}`);
    if (!origin) return cb(null, true);
    if (config.nodeEnv !== "production") return cb(null, true);

    const rawOrigin = config.cors.origin || "";
    console.log(`[CORS] CORS_ORIGIN env value="${rawOrigin}"`);
    const allowList = rawOrigin.split(",").map((o) => o.trim()).filter(Boolean);

    if (
      origin.endsWith(".vercel.app") ||
      origin.includes("localhost") ||
      origin.includes("127.0.0.1") ||
      allowList.includes(origin)
    ) return cb(null, true);
    console.log(`[CORS] BLOCKED origin=${origin}`);
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
    console.log(`[OPTIONS] preflight for ${req.path} from ${req.headers.origin}`);
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

// ─── Body parsing ────────────────────────────────────────────────────────────
// The gateway needs to parse the body so onProxyReq can restream it to the
// downstream service. Without this req.body is undefined and the downstream
// receives an empty body — causing validation failures and 500 errors.
app.use(express.json({ limit: "1mb", strict: false }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// ─── Rate limiting ────────────────────────────────────────────────────────────
// Log parsed body for POST requests
app.use((req, res, next) => {
  if (["POST","PATCH","PUT"].includes(req.method)) {
    console.log(`[BODY] ${req.method} ${req.originalUrl} body=${JSON.stringify(req.body)}`);
  }
  next();
});
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
