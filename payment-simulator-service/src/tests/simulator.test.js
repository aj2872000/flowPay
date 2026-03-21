const request = require("supertest");
const app     = require("../app");

const BASE = "/api/simulate";

// Simulate gateway-forwarded identity headers
const authHeaders = {
  "x-user-id":    "usr_test_01",
  "x-user-email": "test@flowpay.io",
  "x-user-role":  "admin",
};

// Internal service header (billing-service style)
const internalHeaders = {
  "x-internal-service": "billing-service",
};

const validBody = {
  customer: "Test Corp",
  amount:   999,
  currency: "USD",
  method:   "card_visa",
};

// ─── GET /api/simulate/scenarios ─────────────────────────────────────────────
describe("GET /api/simulate/scenarios", () => {
  it("returns all scenarios", async () => {
    const res = await request(app)
      .get(`${BASE}/scenarios`)
      .set(authHeaders);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.scenarios)).toBe(true);
    expect(res.body.data.scenarios.length).toBeGreaterThanOrEqual(9);
  });

  it("each scenario has required fields", async () => {
    const res = await request(app)
      .get(`${BASE}/scenarios`)
      .set(authHeaders);

    for (const s of res.body.data.scenarios) {
      expect(s).toHaveProperty("id");
      expect(s).toHaveProperty("label");
      expect(s).toHaveProperty("status");
      expect(s).toHaveProperty("retryable");
    }
  });

  it("returns 401 without auth", async () => {
    const res = await request(app).get(`${BASE}/scenarios`);
    expect(res.statusCode).toBe(401);
  });
});

// ─── POST /api/simulate/charge ────────────────────────────────────────────────
describe("POST /api/simulate/charge – happy path", () => {
  it("returns succeeded for scenario=success", async () => {
    const res = await request(app)
      .post(`${BASE}/charge`)
      .set(authHeaders)
      .send({ ...validBody, scenario: "success" });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe("succeeded");
    expect(res.body.data.retryable).toBe(false);
    expect(res.body.data.id).toMatch(/^pay_sim_/);
    expect(res.body.data.declineCode).toBeNull();
  });

  it("defaults to success when scenario is omitted", async () => {
    const res = await request(app)
      .post(`${BASE}/charge`)
      .set(authHeaders)
      .send(validBody);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe("succeeded");
  });
});

// ─── Soft declines (retryable) ────────────────────────────────────────────────
describe("POST /api/simulate/charge – soft declines", () => {
  const softDeclines = ["insufficient_funds", "network_error", "processing_error"];

  for (const scenario of softDeclines) {
    it(`returns failed + retryable=true for scenario=${scenario}`, async () => {
      const res = await request(app)
        .post(`${BASE}/charge`)
        .set(authHeaders)
        .send({ ...validBody, scenario });

      expect(res.statusCode).toBe(402);
      expect(res.body.data.status).toBe("failed");
      expect(res.body.data.retryable).toBe(true);
      expect(res.body.data.declineCode).toBe(scenario);
    });
  }
});

// ─── Hard declines (not retryable) ───────────────────────────────────────────
describe("POST /api/simulate/charge – hard declines", () => {
  const hardDeclines = ["card_declined", "fraud_detected", "card_expired", "invalid_cvv", "stolen_card"];

  for (const scenario of hardDeclines) {
    it(`returns failed + retryable=false for scenario=${scenario}`, async () => {
      const res = await request(app)
        .post(`${BASE}/charge`)
        .set(authHeaders)
        .send({ ...validBody, scenario });

      expect(res.statusCode).toBe(402);
      expect(res.body.data.status).toBe("failed");
      expect(res.body.data.retryable).toBe(false);
      expect(res.body.data.declineCode).toBe(scenario);
    });
  }
});

// ─── Validation ───────────────────────────────────────────────────────────────
describe("POST /api/simulate/charge – validation", () => {
  it("returns 422 when customer is missing", async () => {
    const res = await request(app)
      .post(`${BASE}/charge`)
      .set(authHeaders)
      .send({ amount: 100 });

    expect(res.statusCode).toBe(422);
    expect(res.body.error.details.some((d) => d.field === "customer")).toBe(true);
  });

  it("returns 422 when amount is zero", async () => {
    const res = await request(app)
      .post(`${BASE}/charge`)
      .set(authHeaders)
      .send({ customer: "X", amount: 0 });

    expect(res.statusCode).toBe(422);
  });

  it("returns 422 for unknown scenario", async () => {
    const res = await request(app)
      .post(`${BASE}/charge`)
      .set(authHeaders)
      .send({ ...validBody, scenario: "not_a_real_scenario" });

    expect(res.statusCode).toBe(422);
  });

  it("returns 401 without auth", async () => {
    const res = await request(app)
      .post(`${BASE}/charge`)
      .send(validBody);

    expect(res.statusCode).toBe(401);
  });
});

// ─── Internal service-to-service call ────────────────────────────────────────
describe("POST /api/simulate/charge – internal call", () => {
  it("accepts x-internal-service header instead of JWT", async () => {
    const res = await request(app)
      .post(`${BASE}/charge`)
      .set(internalHeaders)
      .send({ ...validBody, scenario: "success" });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe("succeeded");
  });
});

// ─── Response shape ───────────────────────────────────────────────────────────
describe("POST /api/simulate/charge – response shape", () => {
  it("returns all required fields", async () => {
    const res = await request(app)
      .post(`${BASE}/charge`)
      .set(authHeaders)
      .send({ ...validBody, scenario: "success" });

    const d = res.body.data;
    expect(d).toHaveProperty("id");
    expect(d).toHaveProperty("status");
    expect(d).toHaveProperty("amount");
    expect(d).toHaveProperty("currency");
    expect(d).toHaveProperty("customer");
    expect(d).toHaveProperty("method");
    expect(d).toHaveProperty("scenario");
    expect(d).toHaveProperty("retryable");
    expect(d).toHaveProperty("declineCode");
    expect(d).toHaveProperty("message");
    expect(d).toHaveProperty("timestamp");
  });

  it("echoes back the submitted amount and customer", async () => {
    const res = await request(app)
      .post(`${BASE}/charge`)
      .set(authHeaders)
      .send({ customer: "Nexus Corp", amount: 4999, scenario: "success" });

    expect(res.body.data.customer).toBe("Nexus Corp");
    expect(res.body.data.amount).toBe(4999);
  });
});

// ─── Health check ─────────────────────────────────────────────────────────────
describe("GET /health", () => {
  it("returns healthy status", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("healthy");
    expect(res.body.service).toBe("payment-simulator-service");
  });
});
