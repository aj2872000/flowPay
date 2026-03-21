const { createProxyMiddleware } = require("http-proxy-middleware");
const http   = require("http");
const logger = require("../utils/logger");

// Shared keep-alive agent — reuses TCP connections to downstream services
const keepAliveAgent = new http.Agent({
  keepAlive:      true,
  keepAliveMsecs: 60_000,
  maxSockets:     50,
  maxFreeSockets: 10,
});

/**
 * Creates a proxy middleware that forwards requests to a downstream service.
 *
 * @param {string}            target      - Downstream base URL e.g. "http://localhost:8081"
 * @param {Function|object}   pathRewrite - Function (path) => newPath  OR  object map.
 *                                          Use a function for dynamic rewrites with params.
 *                                          http-proxy-middleware v2 supports both.
 * @param {string}            serviceName - Label used in log output
 */
const createServiceProxy = (target, pathRewrite, serviceName = "service") => {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    agent:        keepAliveAgent,

    // pathRewrite can be a function (path, req) => string  or  a plain object.
    // When it's a function we wrap it to match the expected signature.
    pathRewrite: typeof pathRewrite === "function"
      ? (path, req) => pathRewrite(path, req)
      : pathRewrite,

    // ── http-proxy-middleware v2 flat event hooks ────────────────────────────
    onProxyReq(proxyReq, req) {
      // If express.json() somehow consumed the body upstream, restream it.
      // (Shouldn't happen on the gateway, but a safety net.)
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyStr = JSON.stringify(req.body);
        proxyReq.setHeader("Content-Type",   "application/json");
        proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyStr));
        proxyReq.write(bodyStr);
      }

      logger.debug(`[proxy] → ${serviceName}`, {
        method:    req.method,
        from:      req.originalUrl,
        to:        proxyReq.path,
        requestId: req.requestId,
      });
    },

    onProxyRes(proxyRes, req) {
      logger.debug(`[proxy] ← ${serviceName}`, {
        status:    proxyRes.statusCode,
        path:      req.originalUrl,
        requestId: req.requestId,
      });
    },

    onError(err, req, res) {
      logger.error(`[proxy] ${serviceName} error`, {
        error:     err.message,
        code:      err.code,
        target,
        path:      req.originalUrl,
        requestId: req.requestId,
      });

      if (res.headersSent) return;

      const status =
        err.code === "ECONNREFUSED" ? 503 :
        err.code === "ECONNRESET"   ? 502 :
        err.code === "ETIMEDOUT"    ? 504 : 502;

      const message =
        err.code === "ECONNREFUSED"
          ? `${serviceName} is not running — start it first`
          : err.code === "ETIMEDOUT"
          ? `${serviceName} timed out`
          : `${serviceName} is unavailable`;

      res.status(status).json({ success: false, error: { message } });
    },
  });
};

module.exports = { createServiceProxy };
