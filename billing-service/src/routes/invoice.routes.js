const express = require('express');
const router = express.Router();
const controller = require('../controllers/invoice.controller');

router.post('/generate', controller.generateInvoice);

module.exports = router;
