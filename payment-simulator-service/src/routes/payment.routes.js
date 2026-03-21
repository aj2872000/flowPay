const express = require('express');
const router = express.Router();

const {
  simulatePayment,
  simulateWebhook
} = require('../controllers/payment.controller');

router.post('/payment', simulatePayment);
router.post('/webhook', simulateWebhook);

module.exports = router;
