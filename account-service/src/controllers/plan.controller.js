const planService = require('../services/plan.service');

exports.createPlan = async (req, res) => {
  try {
    const plan = await planService.createPlan(req.body);
    res.status(201).json(plan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPlans = async (req, res) => {
  try {
    const plans = await planService.getPlans();
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
