const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authorize = require('../middlewares/role.middleware');

router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected route (USER or ADMIN)
router.get(
  '/profile',
  authorize(['USER', 'ADMIN']),
  authController.getProfile
);

// Admin-only route example
router.get(
  '/admin',
  authorize(['ADMIN']),
  (req, res) => {
    res.json({ message: 'Admin access granted' });
  }
);

module.exports = router;
