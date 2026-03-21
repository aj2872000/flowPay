const express  = require("express");
const helmet   = require("helmet");
const cors     = require("cors");
const config   = require("./config");

const { requestId, httpLogger } = require("./middleware/logger");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const healthRoutes = require("./routes/health.routes");
const authRoutes   = require("./routes/auth.routes");

const app = express();

// ─── Security ────────────────────────────────────────────────────────────────
app.use(helmet());


// ─── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = Array.isArray(config.cors.origin)
  ? config.cors.origin
  : [config.cors.origin, "http://localhost:3000", "http://127.0.0.1:3000"];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (config.nodeEnv === "development") return cb(null, true);
    // Allow all Vercel preview/production URLs
    if (origin && (
      origin.endsWith(".vercel.app") ||
      origin.includes("localhost") ||
      allowedOrigins.includes(origin)
    )) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials:    true,
  methods:        ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-request-id",
                   "x-user-id", "x-user-email", "x-user-role"],
  optionsSuccessStatus: 200, // Some browsers (IE11) choke on 204
}));

// Handle preflight for all routes explicitly
app.options("*", cors());

// ─── Body parsing ────────────────────────────────────────────────────────────
// Must come BEFORE request-id and logger so body is available to all middleware
app.use(express.json({ limit: "1mb", strict: false }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// ─── Request enrichment ──────────────────────────────────────────────────────
app.use(requestId);
app.use(httpLogger);

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/health",    healthRoutes);
app.use("/api/auth",  authRoutes);

// ─── Error handling ──────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
