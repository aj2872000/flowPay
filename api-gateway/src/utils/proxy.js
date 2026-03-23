const { createProxyMiddleware } = require("http-proxy-middleware");
const https = require("https");
const http  = require("http");
const logger = require("../utils/logger");

const httpAgent  = new http.Agent({  keepAlive: true, maxSockets: 50 });
const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 50 });

const createServiceProxy = (target, pathRewrite, serviceName = "service") => {
  const isHttps = target.startsWith("https");

  return createProxyMiddleware({
    target,
    changeOrigin: true,
    secure:       isHttps,
    agent:        isHttps ? httpsAgent : httpAgent,

    pathRewrite: typeof pathRewrite === "function"
      ? (path, req) => pathRewrite(path, req)
      : pathRewrite,

    // ── hpm v2 flat event hooks ───────────────────────────────────────────────
    onProxyReq(proxyReq, req) {
      // Restream body that express.json() already consumed from the raw stream
      // Only for methods that carry a body, and only when body is non-empty
      if (
        req.body &&
        typeof req.body === "object" &&
        Object.keys(req.body).length > 0 &&
        req.method !== "GET" &&
        req.method !== "HEAD"
      ) {
        const body = JSON.stringify(req.body);
        proxyReq.setHeader("Content-Type",   "application/json");
        proxyReq.setHeader("Content-Length", Buffer.byteLength(body));
        proxyReq.write(body);
        // DO NOT call proxyReq.end() — hpm calls it after onProxyReq returns
      }

      logger.debug(`[proxy] → ${serviceName}`, {
        method: req.method,
        from:   req.originalUrl,
        to:     proxyReq.path,
      });
    },

    onProxyRes(proxyRes, req) {
      logger.debug(`[proxy] ← ${serviceName}`, {
        status: proxyRes.statusCode,
        path:   req.originalUrl,
      });
    },

    onError(err, req, res) {
      logger.error(`[proxy] ${serviceName} error`, {
        error: err.message, code: err.code, target, path: req.originalUrl,
      });
      if (res.headersSent) return;
      const status =
        err.code === "ECONNREFUSED" ? 503 :
        err.code === "ECONNRESET"   ? 502 :
        err.code === "ETIMEDOUT"    ? 504 : 502;
      res.status(status).json({
        success: false,
        error: {
          message:
            err.code === "ECONNREFUSED" ? `${serviceName} is not running` :
            err.code === "ETIMEDOUT"    ? `${serviceName} timed out` :
            `${serviceName} is unavailable: ${err.message}`,
        },
      });
    },
  });
};

module.exports = { createServiceProxy };
