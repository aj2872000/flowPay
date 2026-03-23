// Simple logger that writes plain text to stdout/stderr.
// Railway captures process.stdout reliably — Winston with JSON format
// sometimes doesn't appear in Railway's log viewer.

const isProd = process.env.NODE_ENV === "production";

const ts = () => new Date().toISOString();

const fmt = (level, message, meta) => {
  const base = `${ts()} [${level.toUpperCase()}] ${message}`;
  if (!meta || Object.keys(meta).length === 0) return base;
  try {
    return `${base} ${JSON.stringify(meta)}`;
  } catch {
    return base;
  }
};

const logger = {
  debug: (message, meta = {}) => {
    process.stdout.write(fmt("debug", message, meta) + "\n");
  },
  info: (message, meta = {}) => {
    process.stdout.write(fmt("info", message, meta) + "\n");
  },
  warn: (message, meta = {}) => {
    process.stdout.write(fmt("warn", message, meta) + "\n");
  },
  error: (message, meta = {}) => {
    process.stderr.write(fmt("error", message, meta) + "\n");
  },
  http: (message, meta = {}) => {
    process.stdout.write(fmt("http", message, meta) + "\n");
  },
};

module.exports = logger;
