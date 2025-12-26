const router = require('express').Router();
const controller = require('../controllers/subscription.controller');

router.post('/', controller.subscribe);
router.put('/:id/cancel', controller.cancel);
router.get('/user', controller.getUserSubscriptions);

module.exports = router;
