const router = require('express').Router();
const controller = require('../controllers/subscription.controller');

router.post('/', controller.subscribe);
router.put('/:id/cancel', controller.cancel);
router.get('/user/:userId', controller.getUserSubscriptions);

module.exports = router;
