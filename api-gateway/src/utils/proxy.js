const { createProxyMiddleware } = require("http-proxy-middleware");
const http  = require("http");
const https = require("https");
const logger = require("../utils/logger");

const httpAgent = new http.Agent({
  keepAlive: true, keepAliveMsecs: 60_000, maxSockets: 50,
});
const httpsAgent = new https.Agent({
  keepAlive: true, keepAliveMsecs: 60_000, maxSockets: 50,
});

const createServiceProxy = (target, pathRewrite, serviceName = "service") => {
  // Auto-select agent based on target protocol
  // Railway/production services use https://, local dev uses http://
  const agent = target.startsWith("https") ? httpsAgent : httpAgent;

  return createProxyMiddleware({
    target,
    changeOrigin: true,
    secure:       target.startsWith("https"), // verify SSL for https targets
    agent,

    pathRewrite: typeof pathRewrite === "function"
      ? (path, req) => pathRewrite(path, req)
      : pathRewrite,

    onProxyReq(proxyReq, req) {
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyStr = JSON.stringify(req.body);
        proxyReq.setHeader("Content-Type",   "application/json");
        proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyStr));
        proxyReq.write(bodyStr);
      }
      logger.debug(`[proxy] → ${serviceName}`, {
        method: req.method, from: req.originalUrl,
        to: proxyReq.path, requestId: req.requestId,
      });
    },

    onProxyRes(proxyRes, req) {
      logger.debug(`[proxy] ← ${serviceName}`, {
        status: proxyRes.statusCode, path: req.originalUrl,
        requestId: req.requestId,
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
            `${serviceName} is unavailable`,
        },
      });
    },
  });
};

module.exports = { createServiceProxy };
