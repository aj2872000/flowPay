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

// ─── Security headers ────────────────────────────────────────────────────────
// Disable helmet's crossOriginResourcePolicy — it sets headers that block
// cross-origin requests from the React UI running on a different port.
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy:   false,
}));

// ─── CORS ────────────────────────────────────────────────────────────────────
// Always allow the UI origin. In development allow all origins so any port works.
// The Access-Control-Allow-Origin header must echo back the request's Origin,
// NOT a hardcoded URL — that's what the function form does.
const corsOptions = {
  origin(origin, cb) {
    // No origin = Postman / curl / server-to-server — always allow
    if (!origin) return cb(null, true);
      if (config.nodeEnv === "development") return cb(null, true);
      if (origin && (origin.endsWith(".vercel.app") || origin.includes("localhost"))) return cb(null, true);
      const allowed = Array.isArray(config.cors?.origin) ? config.cors.origin : [config.cors?.origin];
      if (allowed.includes(origin)) return cb(null, true);
      cb(new Error("CORS blocked"));
  },
  credentials:      true,
  methods:          ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders:   ["Content-Type", "Authorization", "x-request-id"],
  exposedHeaders:   ["x-request-id", "RateLimit-Limit", "RateLimit-Remaining"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
// Handle preflight OPTIONS for every route
app.options("*", cors(corsOptions));

// ─── Request enrichment ───────────────────────────────────────────────────────
app.use(requestId);
app.use(httpLogger);

// ─── IMPORTANT: NO express.json() here ───────────────────────────────────────
// The gateway is a pure reverse proxy. Parsing the body with express.json()
// consumes the readable stream. When http-proxy-middleware then tries to pipe
// the body to the downstream service it gets an empty stream, causing the
// downstream to hang waiting for data → timeout / socket hang-up.
//
// Body parsing happens inside each downstream service, not here.
// The only exception: routes that need to read the body BEFORE proxying
// (e.g. auth middleware reading JWT) use req.headers only, not req.body.

// ─── Rate limiting ────────────────────────────────────────────────────────────
app.use(globalLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/health",        healthRoutes);
app.use("/api/auth",      authRoutes);
app.use("/api/accounts",  accountRoutes);
app.use("/api/billing",   billingRoutes);
app.use("/api/events",    eventRoutes);
app.use("/api/simulator", simulatorRoutes);

// ─── Fallback & error handling ────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
