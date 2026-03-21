const { Router } = require("express");
const { authenticate } = require("../middleware/auth");
const { createServiceProxy } = require("../utils/proxy");
const config = require("../config");

const router = Router();

const eventProxy = createServiceProxy(
  config.services.event,
  {
    "^/events/([^/]+)":          "/api/events/events/$1",
    "^/events":                  "/api/events/events",
    "^/webhooks/([^/]+)/test":   "/api/events/webhooks/$1/test",
    "^/webhooks/([^/]+)":        "/api/events/webhooks/$1",
    "^/webhooks":                "/api/events/webhooks",
  },
  "event-service"
);

router.use(authenticate);

router.get("/events",      eventProxy);
router.get("/events/:id",  eventProxy);

router.get("/webhooks",           eventProxy);
router.post("/webhooks",          eventProxy);
router.patch("/webhooks/:id",     eventProxy);
router.delete("/webhooks/:id",    eventProxy);
router.post("/webhooks/:id/test", eventProxy);

module.exports = router;
