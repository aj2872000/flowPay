const { createProxyMiddleware } = require("http-proxy-middleware");
const logger = require("../utils/logger");

/**
 * Creates a proxy middleware that forwards requests to a downstream service.
 *
 * IMPORTANT – body stream:
 *   The gateway must NOT call express.json() before proxying. If the body
 *   stream is consumed by express.json(), http-proxy-middleware cannot pipe
 *   it to the downstream service and the downstream receives an empty body,
 *   causing it to time out or return a validation error.
 *
 * IMPORTANT – http-proxy-middleware v2 API:
 *   v2.x uses onProxyReq / onProxyRes / onError (flat options).
 *   The { on: { proxyReq } } syntax is v3+ only.
 *
 * @param {string} target      - Downstream base URL e.g. "http://localhost:8081"
 * @param {object} pathRewrite - Path rewrite rules e.g. { "^/": "/api/auth/" }
 * @param {string} serviceName - Label for log output
 */
const createServiceProxy = (target, pathRewrite = {}, serviceName = "service") => {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite,

    // Fix for Node v20 keep-alive: reuse connections to downstream services
    // without closing them between requests
    agent: new (require("http").Agent)({
      keepAlive: true,
      keepAliveMsecs: 60_000,
      maxSockets: 50,
    }),

    // ── http-proxy-middleware v2 event hooks (flat, not nested under 'on') ──
    onProxyReq: (proxyReq, req) => {
      // If the body was already parsed by express.json() (it shouldn't be on
      // the gateway, but just in case), restream it so the downstream gets it.
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyStr = JSON.stringify(req.body);
        proxyReq.setHeader("Content-Type",   "application/json");
        proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyStr));
        proxyReq.write(bodyStr);
      }

      logger.info(`[proxy] → ${serviceName}`, {
        method:       req.method,
        originalPath: req.originalUrl,
        targetPath:   proxyReq.path,
        requestId:    req.requestId,
      });
    },

    onProxyRes: (proxyRes, req) => {
      logger.info(`[proxy] ← ${serviceName}`, {
        status:    proxyRes.statusCode,
        path:      req.originalUrl,
        requestId: req.requestId,
      });
    },

    onError: (err, req, res) => {
      logger.error(`[proxy] ${serviceName} unreachable`, {
        error:     err.message,
        code:      err.code,
        target,
        path:      req.originalUrl,
        requestId: req.requestId,
      });

      if (res.headersSent) return;

      const status  = err.code === "ECONNREFUSED"  ? 503
                    : err.code === "ECONNRESET"     ? 502
                    : err.code === "ETIMEDOUT"      ? 504
                    : 502;

      const message = err.code === "ECONNREFUSED"
        ? `${serviceName} is not running (connection refused)`
        : err.code === "ETIMEDOUT"
        ? `${serviceName} timed out`
        : `${serviceName} is unavailable`;

      res.status(status).json({ success: false, error: { message } });
    },
  });
};

module.exports = { createServiceProxy };
