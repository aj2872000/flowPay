const { Router } = require("express");
const config = require("../config");
const logger = require("../utils/logger");

const router = Router();

/**
 * GET /health
 *
 * Used by Docker health checks, load balancers, and monitoring tools.
 * Also pings each downstream service to report their reachability.
 */
router.get("/", async (req, res) => {
  const start = Date.now();

  // Ping each downstream service's own /health endpoint
  const serviceChecks = await Promise.allSettled(
    Object.entries(config.services).map(async ([name, url]) => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        const resp = await fetch(`${url}/health`, { signal: controller.signal });
        clearTimeout(timeout);
        return { name, status: resp.ok ? "up" : "degraded", code: resp.status };
      } catch {
        return { name, status: "down", code: null };
      }
    })
  );

  const services = serviceChecks.map((r) =>
    r.status === "fulfilled" ? r.value : { name: "unknown", status: "down" }
  );

  const allUp = services.every((s) => s.status === "up");

  const payload = {
    status: allUp ? "healthy" : "degraded",
    uptime: process.uptime(),
    responseTimeMs: Date.now() - start,
    timestamp: new Date().toISOString(),
    services: Object.fromEntries(services.map((s) => [s.name, s.status])),
  };

  logger.debug("Health check", payload);
  return res.status(allUp ? 200 : 207).json(payload);
});

module.exports = router;
