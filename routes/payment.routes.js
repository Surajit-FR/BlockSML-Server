
const express = require('express');
const router = express.Router();
const RequestRate = require('../helpers/request_limiter');
const PaymentController = require('../controller/payment.controller');
const { VerifyToken } = require('../middleware/auth/auth_user');

// Create checkout session
router.post('/create-checkout-session', [RequestRate.Limiter, VerifyToken], PaymentController.CreateCheckoutSession);
// Update subscription
router.post('/update-subscription', [RequestRate.Limiter, VerifyToken], PaymentController.UpdateSubscription);
// Payment Success
router.post('/payment-success', [RequestRate.Limiter, VerifyToken], PaymentController.PaymentSuceess);
// Billing portal
router.post('/billing-portal', [RequestRate.Limiter, VerifyToken], PaymentController.BillingPortal);


module.exports = router;