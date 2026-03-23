const { createProxyMiddleware } = require("http-proxy-middleware");
const http  = require("http");
const https = require("https");
const logger = require("../utils/logger");

const httpAgent  = new http.Agent({  keepAlive: true, maxSockets: 50 });
const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 50 });

const createServiceProxy = (target, pathRewrite, serviceName = "service") => {
  const isHttps = target.startsWith("https");
  const agent   = isHttps ? httpsAgent : httpAgent;

  return createProxyMiddleware({
    target,
    changeOrigin: true,
    secure:       isHttps,
    agent,

    pathRewrite: typeof pathRewrite === "function"
      ? (path, req) => pathRewrite(path, req)
      : pathRewrite,

    onProxyReq(proxyReq, req) {
      // Body restream — only when body exists and was parsed by express.json()
      // Guard against undefined/null/empty body to prevent crashes
      if (
        req.body !== undefined &&
        req.body !== null &&
        typeof req.body === "object" &&
        Object.keys(req.body).length > 0
      ) {
        const bodyStr = JSON.stringify(req.body);
        proxyReq.setHeader("Content-Type",   "application/json");
        proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyStr));
        proxyReq.write(bodyStr);
        proxyReq.end();
      }

      logger.debug(`[proxy] → ${serviceName}`, {
        method: req.method, from: req.originalUrl, to: proxyReq.path,
      });
    },

    onProxyRes(proxyRes, req) {
      logger.debug(`[proxy] ← ${serviceName}`, {
        status: proxyRes.statusCode, path: req.originalUrl,
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
