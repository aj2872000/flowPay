const request = require("supertest");
const app     = require("../app");

// Jest config points setupFilesAfterFramework to ./setup.js
// which spins up an in-memory MongoDB before these tests run.

const BASE = "/api/auth";

const validUser = {
  name:     "Test User",
  email:    "test@flowpay.io",
  password: "Secret123!",
};

// ─── REGISTER ────────────────────────────────────────────────────────────────
describe("POST /api/auth/register", () => {
  it("creates a new user and returns 201", async () => {
    const res = await request(app).post(`${BASE}/register`).send(validUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      email: validUser.email,
      name:  validUser.name,
      role:  "user",
    });
    // Sensitive fields must never be returned
    expect(res.body.data.password).toBeUndefined();
    expect(res.body.data.refreshTokens).toBeUndefined();
  });

  it("returns 409 when email is already registered", async () => {
    await request(app).post(`${BASE}/register`).send(validUser);
    const res = await request(app).post(`${BASE}/register`).send(validUser);

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it("returns 422 when required fields are missing", async () => {
    const res = await request(app)
      .post(`${BASE}/register`)
      .send({ email: "bad" });

    expect(res.statusCode).toBe(422);
    expect(res.body.error.details).toBeDefined();
  });

  it("returns 422 when password is too weak", async () => {
    const res = await request(app)
      .post(`${BASE}/register`)
      .send({ ...validUser, password: "weak" });

    expect(res.statusCode).toBe(422);
  });
});

// ─── LOGIN ────────────────────────────────────────────────────────────────────
describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await request(app).post(`${BASE}/register`).send(validUser);
  });

  it("returns tokens and user on valid credentials", async () => {
    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ email: validUser.email, password: validUser.password });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    expect(res.body.data.user.email).toBe(validUser.email);
  });

  it("returns 401 on wrong password", async () => {
    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ email: validUser.email, password: "WrongPass1!" });

    expect(res.statusCode).toBe(401);
  });

  it("returns 401 on unknown email", async () => {
    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ email: "nobody@flowpay.io", password: "Secret123!" });

    expect(res.statusCode).toBe(401);
  });
});

// ─── REFRESH ─────────────────────────────────────────────────────────────────
describe("POST /api/auth/refresh", () => {
  let refreshToken;

  beforeEach(async () => {
    await request(app).post(`${BASE}/register`).send(validUser);
    const loginRes = await request(app)
      .post(`${BASE}/login`)
      .send({ email: validUser.email, password: validUser.password });
    refreshToken = loginRes.body.data.refreshToken;
  });

  it("returns a new access token", async () => {
    const res = await request(app)
      .post(`${BASE}/refresh`)
      .send({ refreshToken });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  it("returns 401 when refresh token is reused after rotation", async () => {
    // Use the token once
    const firstRes = await request(app)
      .post(`${BASE}/refresh`)
      .send({ refreshToken });
    expect(firstRes.statusCode).toBe(200);

    // Reuse the original – should be rejected
    const secondRes = await request(app)
      .post(`${BASE}/refresh`)
      .send({ refreshToken });
    expect(secondRes.statusCode).toBe(401);
  });

  it("returns 401 for an invalid token", async () => {
    const res = await request(app)
      .post(`${BASE}/refresh`)
      .send({ refreshToken: "not.a.valid.token" });

    expect(res.statusCode).toBe(401);
  });
});

// ─── LOGOUT ──────────────────────────────────────────────────────────────────
describe("POST /api/auth/logout", () => {
  let accessToken, refreshToken;

  beforeEach(async () => {
    await request(app).post(`${BASE}/register`).send(validUser);
    const loginRes = await request(app)
      .post(`${BASE}/login`)
      .send({ email: validUser.email, password: validUser.password });
    accessToken  = loginRes.body.data.accessToken;
    refreshToken = loginRes.body.data.refreshToken;
  });

  it("returns 200 and invalidates the refresh token", async () => {
    const res = await request(app)
      .post(`${BASE}/logout`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ refreshToken });

    expect(res.statusCode).toBe(200);

    // Refresh token should now be invalid
    const refreshRes = await request(app)
      .post(`${BASE}/refresh`)
      .send({ refreshToken });
    expect(refreshRes.statusCode).toBe(401);
  });
});

// ─── ME ──────────────────────────────────────────────────────────────────────
describe("GET /api/auth/me", () => {
  let accessToken;

  beforeEach(async () => {
    await request(app).post(`${BASE}/register`).send(validUser);
    const loginRes = await request(app)
      .post(`${BASE}/login`)
      .send({ email: validUser.email, password: validUser.password });
    accessToken = loginRes.body.data.accessToken;
  });

  it("returns user profile with valid token", async () => {
    const res = await request(app)
      .get(`${BASE}/me`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.email).toBe(validUser.email);
    expect(res.body.data.password).toBeUndefined();
  });

  it("returns 401 without a token", async () => {
    const res = await request(app).get(`${BASE}/me`);
    expect(res.statusCode).toBe(401);
  });
});
