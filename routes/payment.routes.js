
const express = require('express');
const router = express.Router();
const RequestRate = require('../helpers/request_limiter');
const PaymentController = require('../controller/payment.controller');
const { VerifyToken } = require('../middleware/auth/auth_user');

// Stripe Test
router.post('/create-checkout-session', [RequestRate.Limiter, VerifyToken], PaymentController.CreateCheckoutSession);
// Payment Success
router.post('/payment-success', [RequestRate.Limiter, VerifyToken], PaymentController.PaymentSuceess);


module.exports = router;