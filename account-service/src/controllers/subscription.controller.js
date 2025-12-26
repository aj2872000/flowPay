const subscriptionService = require('../services/subscription.service');
const billingClient = require('../utils/billingClient');

exports.subscribe = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { planId, amount } = req.body;
    const subscription = await subscriptionService.createSubscription(userId, planId);

    // Call Billing Service (side-effect)
    const idempotencyKey = `inv:${subscription.id}`;
    await billingClient.createInvoice(
      {
        subscriptionId: subscription.id,
        userId,
        planId,
        amount: amount 
      },
      req.headers.authorization,
      idempotencyKey
    );
    res.status(201).json(subscription);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.cancel = async (req, res) => {
  try {
    const sub = await subscriptionService.cancelSubscription(req.params.id);
    res.json(sub);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserSubscriptions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const subs = await subscriptionService.getUserSubscriptions(userId);
    res.json(subs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
