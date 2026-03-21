const { Router } = require("express");
const { authenticate }  = require("../middleware/auth");
const { validate, createWebhookRules, updateWebhookRules } = require("../middleware/validate");
const { listEvents, getEvent, publishEvent } = require("../controllers/event.controller");
const { listWebhooks, createWebhook, updateWebhook, deleteWebhook, testWebhook } = require("../controllers/webhook.controller");

const router = Router();

// ── Internal route (no JWT – called by other services) ───────────────────────
// Intentionally before the authenticate middleware
router.post("/internal/events", publishEvent);

// ── Protected routes (JWT via gateway) ───────────────────────────────────────
router.use(authenticate);

// Events (read-only from the UI)
router.get("/api/events/events",     listEvents);
router.get("/api/events/events/:id", getEvent);

// Webhooks (CRUD)
router.get("/api/events/webhooks",          listWebhooks);
router.post("/api/events/webhooks",         createWebhookRules, validate, createWebhook);
router.patch("/api/events/webhooks/:id",    updateWebhookRules, validate, updateWebhook);
router.delete("/api/events/webhooks/:id",   deleteWebhook);
router.post("/api/events/webhooks/:id/test",testWebhook);

module.exports = router;
