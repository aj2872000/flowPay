const subscriptionService = require('../services/subscription.service');

exports.subscribe = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { planId } = req.body;
    const sub = await subscriptionService.createSubscription(userId, planId);
    res.status(201).json(sub);
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
