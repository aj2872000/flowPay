const request  = require("supertest");
const app      = require("../app");
const Event    = require("../models/event.model");
const Webhook  = require("../models/webhook.model");

const BASE     = "/api/events";
const INTERNAL = "/internal/events";

// Simulate gateway forwarding user identity via headers
const authHeaders = {
  "x-user-id":    "usr_test_01",
  "x-user-email": "test@flowpay.io",
  "x-user-role":  "admin",
};

// ─── Internal publish ────────────────────────────────────────────────────────
describe("POST /internal/events", () => {
  it("creates an event and returns 201", async () => {
    const res = await request(app)
      .post(INTERNAL)
      .send({ type: "payment.succeeded", service: "billing-service", payload: { amount: 999 } });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.type).toBe("payment.succeeded");
  });

  it("returns 422 when type is missing", async () => {
    const res = await request(app)
      .post(INTERNAL)
      .send({ service: "billing-service" });

    expect(res.statusCode).toBe(422);
  });
});

// ─── List events ─────────────────────────────────────────────────────────────
describe("GET /api/events/events", () => {
  beforeEach(async () => {
    await Event.create([
      { type: "payment.succeeded", service: "billing-service", payload: {}, status: "delivered" },
      { type: "payment.failed",    service: "billing-service", payload: {}, status: "failed"    },
    ]);
  });

  it("returns all events", async () => {
    const res = await request(app)
      .get(`${BASE}/events`)
      .set(authHeaders);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.data.length).toBe(2);
    expect(res.body.data.total).toBe(2);
  });

  it("filters by type", async () => {
    const res = await request(app)
      .get(`${BASE}/events?type=payment.failed`)
      .set(authHeaders);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.data.length).toBe(1);
    expect(res.body.data.data[0].type).toBe("payment.failed");
  });

  it("returns 401 without auth headers", async () => {
    const res = await request(app).get(`${BASE}/events`);
    expect(res.statusCode).toBe(401);
  });
});

// ─── Webhooks CRUD ───────────────────────────────────────────────────────────
describe("POST /api/events/webhooks", () => {
  it("registers a new webhook", async () => {
    const res = await request(app)
      .post(`${BASE}/webhooks`)
      .set(authHeaders)
      .send({
        url:    "https://example.com/hook",
        events: ["payment.succeeded", "payment.failed"],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.url).toBe("https://example.com/hook");
    // Secret must never be returned
    expect(res.body.data.secret).toBeUndefined();
  });

  it("returns 422 for invalid URL", async () => {
    const res = await request(app)
      .post(`${BASE}/webhooks`)
      .set(authHeaders)
      .send({ url: "not-a-url", events: ["payment.succeeded"] });

    expect(res.statusCode).toBe(422);
  });

  it("returns 422 when events array is empty", async () => {
    const res = await request(app)
      .post(`${BASE}/webhooks`)
      .set(authHeaders)
      .send({ url: "https://example.com/hook", events: [] });

    expect(res.statusCode).toBe(422);
  });
});

describe("GET /api/events/webhooks", () => {
  beforeEach(async () => {
    await Webhook.create([
      { userId: "usr_test_01", url: "https://a.com/hook", events: ["payment.succeeded"] },
      { userId: "usr_other",   url: "https://b.com/hook", events: ["payment.failed"] },
    ]);
  });

  it("returns only webhooks owned by the caller", async () => {
    const res = await request(app)
      .get(`${BASE}/webhooks`)
      .set(authHeaders);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.webhooks.length).toBe(1);
    expect(res.body.data.webhooks[0].url).toBe("https://a.com/hook");
  });
});

describe("DELETE /api/events/webhooks/:id", () => {
  it("deletes an owned webhook", async () => {
    const wh = await Webhook.create({
      userId: "usr_test_01",
      url:    "https://delete-me.com/hook",
      events: ["payment.succeeded"],
    });

    const res = await request(app)
      .delete(`${BASE}/webhooks/${wh._id}`)
      .set(authHeaders);

    expect(res.statusCode).toBe(200);
    expect(await Webhook.findById(wh._id)).toBeNull();
  });

  it("returns 404 when webhook belongs to another user", async () => {
    const wh = await Webhook.create({
      userId: "usr_other",
      url:    "https://other.com/hook",
      events: ["payment.succeeded"],
    });

    const res = await request(app)
      .delete(`${BASE}/webhooks/${wh._id}`)
      .set(authHeaders);

    expect(res.statusCode).toBe(404);
  });
});
