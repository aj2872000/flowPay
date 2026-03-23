const axios = require("axios");

const createServiceProxy = (target, pathRewrite, serviceName = "service") => {
  return async (req, res) => {
    try {
      let pathname = req.path || "/";
      if (typeof pathRewrite === "function") {
        pathname = pathRewrite(pathname, req);
      }
      const qs  = Object.keys(req.query || {}).length
        ? "?" + new URLSearchParams(req.query).toString()
        : "";
      const url = `${target.replace(/\/$/, "")}${pathname}${qs}`;

      const headers = { "content-type": "application/json" };
      ["authorization","x-request-id","x-user-id","x-user-email","x-user-role","x-internal-service"]
        .forEach((h) => { if (req.headers[h]) headers[h] = req.headers[h]; });

      const isBodyMethod = !["GET","HEAD"].includes(req.method.toUpperCase());
      const hasBody = isBodyMethod && req.body &&
                      typeof req.body === "object" &&
                      Object.keys(req.body).length > 0;

      console.log(`[PROXY] ${req.method} → ${url} hasBody=${hasBody} target=${target}`);

      const response = await axios({
        method:         req.method,
        url,
        headers,
        data:           hasBody ? req.body : undefined,
        timeout:        25000,
        validateStatus: () => true,
        decompress:     true,
        maxRedirects:   0,
      });

      console.log(`[PROXY] ← ${serviceName} ${response.status} from ${url}`);
      if (response.status >= 400) {
        console.log(`[PROXY] error body: ${JSON.stringify(response.data).slice(0, 500)}`);
      }

      const skip = new Set(["transfer-encoding","connection","keep-alive","content-encoding","content-length"]);
      Object.entries(response.headers).forEach(([k, v]) => {
        if (!skip.has(k.toLowerCase())) res.setHeader(k, v);
      });

      return res.status(response.status).json(response.data);

    } catch (err) {
      console.error(`[PROXY] ${serviceName} FAILED: ${err.message} code=${err.code}`);
      console.error(`[PROXY] target was: ${target}`);
      console.error(`[PROXY] stack: ${err.stack}`);
      if (res.headersSent) return;
      const status =
        err.code === "ECONNREFUSED"                              ? 503 :
        err.code === "ECONNRESET"                                ? 502 :
        err.code === "ETIMEDOUT" || err.code === "ECONNABORTED"  ? 504 : 502;
      res.status(status).json({
        success: false,
        error: { message: `${serviceName} error: ${err.message}` },
      });
    }
  };
};

module.exports = { createServiceProxy };
