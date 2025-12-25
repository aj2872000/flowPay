const router = require('express').Router();
const controller = require('../controllers/plan.controller');

router.post('/', controller.createPlan);
router.get('/', controller.getPlans);

module.exports = router;
