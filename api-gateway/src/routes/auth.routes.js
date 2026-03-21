const { Router } = require("express");
const { authLimiter }  = require("../middleware/rateLimiter");
const { authenticate } = require("../middleware/auth");
const { createServiceProxy } = require("../utils/proxy");
const config = require("../config");

const router = Router();

const authProxy = createServiceProxy(
  config.services.auth,
  {
    "^/register":    "/api/auth/register",
    "^/login":       "/api/auth/login",
    "^/refresh":     "/api/auth/refresh",
    "^/logout-all":  "/api/auth/logout-all",
    "^/logout":      "/api/auth/logout",
    "^/me":          "/api/auth/me",
  },
  "auth-service"
);

// Public
router.post("/register",   authLimiter, authProxy);
router.post("/login",      authLimiter, authProxy);
router.post("/refresh",    authLimiter, authProxy);

// Protected
router.post("/logout",     authenticate, authProxy);
router.post("/logout-all", authenticate, authProxy);
router.get("/me",          authenticate, authProxy);

module.exports = router;
