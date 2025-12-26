const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const { pool } = require('../models/init-db')

/**
 * Simulate Payment
 * success | failure | delay | duplicate
 */
exports.simulatePayment = async (req, res) => {
  const { orderId, amount, scenario } = req.body;

  const paymentId = uuidv4();

  let status = 'SUCCESS';
  let delay = 0;

  if (scenario === 'failure') status = 'FAILED';
  if (scenario === 'delay') delay = 5000;
  if (scenario === 'duplicate') status = 'SUCCESS';

  setTimeout(async () => {
    await pool.query(
      `INSERT INTO simulated_payments (id, order_id, status, amount)
       VALUES ($1, $2, $3, $4)`,
      [paymentId, orderId, status, amount]
    );

    // trigger webhook
    await triggerWebhook(orderId, paymentId, status);

    // duplicate webhook
    if (scenario === 'duplicate') {
      await triggerWebhook(orderId, paymentId, status);
    }
  }, delay);

  res.json({
    message: 'Payment simulation started',
    paymentId,
    scenario
  });
};

/**
 * Receive webhook (for testing only)
 */
exports.simulateWebhook = (req, res) => {
  console.log('📩 Webhook received:', req.body);
  res.json({ received: true });
};

/**
 * Trigger webhook to Event Service
 */
async function triggerWebhook(orderId, paymentId, status) {
  try {
    await axios.post(`${process.env.EVENT_SERVICE_URL}/api/events`, {
      orderId,
      paymentId,
      status,
      provider: 'SIMULATOR'
    });
  } catch (err) {
    console.error('Webhook failed:', err.message);
  }
}
