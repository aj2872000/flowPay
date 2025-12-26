const express = require('express');
const { createProxyMiddleware, fixRequestBody } = require('http-proxy-middleware');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * SERVICE MAP
 */
const SERVICES = {
  auth: process.env.AUTH_SERVICE_URL,
  account: process.env.ACCOUNT_SERVICE_URL,
  billing: process.env.BILLING_SERVICE_URL,
  event: process.env.EVENT_SERVICE_URL
};

/**
 * AUTH ROUTES (NO JWT REQUIRED)
 */
router.use(
  '/auth',
  createProxyMiddleware({
    target: SERVICES.auth,
    changeOrigin: true,
    pathRewrite: { '^/api': '' },
    onProxyReq: fixRequestBody
  })
);

/**
 * ACCOUNT SERVICE
 */
router.use(
  '/account',
  authMiddleware,
  createProxyMiddleware({
    target: SERVICES.account,
    changeOrigin: true,
    pathRewrite: { '^/account': '' }
  })
);

/**
 * BILLING SERVICE
 */
router.use(
  '/billing',
  authMiddleware,
  createProxyMiddleware({
    target: SERVICES.billing,
    changeOrigin: true,
    pathRewrite: { '^/billing': '' }
  })
);

/**
 * EVENT SERVICE (INTERNAL)
 */
router.use(
  '/events',
  authMiddleware,
  createProxyMiddleware({
    target: SERVICES.event,
    changeOrigin: true,
    pathRewrite: { '^/events': '' }
  })
);

module.exports = router;
