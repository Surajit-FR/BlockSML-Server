
const express = require('express');
const router = express.Router();
const RequestRate = require('../helpers/request_limiter');
const PaymentController = require('../controller/payment.controller');

// Stripe Test
router.post('/create-checkout-session', [RequestRate.Limiter], PaymentController.CreateCheckoutSession);


module.exports = router;