const { Router } = require("express");
const {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  me,
} = require("../controllers/auth.controller");
const { authenticate }                              = require("../middleware/auth");
const { validate, registerRules, loginRules,
        refreshRules, logoutRules }                  = require("../middleware/validate");

const router = Router();

// ── Public ────────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Create a new account. Returns user object (no tokens – requires login after).
 */
router.post("/register", registerRules, validate, register);

/**
 * POST /api/auth/login
 * Authenticate and receive access + refresh tokens.
 */
router.post("/login", loginRules, validate, login);

/**
 * POST /api/auth/refresh
 * Exchange a valid refresh token for a new access token (token rotation).
 */
router.post("/refresh", refreshRules, validate, refresh);

// ── Protected (valid access token required) ───────────────────────────────────

/**
 * POST /api/auth/logout
 * Invalidate the provided refresh token (single-device logout).
 */
router.post("/logout", authenticate, logoutRules, validate, logout);

/**
 * POST /api/auth/logout-all
 * Revoke ALL refresh tokens for the current user (all-device logout).
 */
router.post("/logout-all", authenticate, logoutAll);

/**
 * GET /api/auth/me
 * Return the currently authenticated user's profile.
 */
router.get("/me", authenticate, me);

module.exports = router;
