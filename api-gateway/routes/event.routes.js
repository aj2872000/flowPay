const { Router } = require("express");
const { authenticate } = require("../middleware/auth");
const { createServiceProxy } = require("../utils/proxy");
const config = require("../config");

const router = Router();

const eventProxy = createServiceProxy(
  config.services.event,
  (path) => `/api/events${path}`,
  "event-service"
);

router.use(authenticate);

router.get("/events",             eventProxy);
router.get("/events/:id",         eventProxy);
router.get("/webhooks",           eventProxy);
router.post("/webhooks",          eventProxy);
router.patch("/webhooks/:id",     eventProxy);
router.delete("/webhooks/:id",    eventProxy);
router.post("/webhooks/:id/test", eventProxy);

module.exports = router;
