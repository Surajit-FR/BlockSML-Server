const express = require('express');
const router = express.Router();
const WebhookController = require('../controller/webhookController');

// Apply raw body parser for Stripe webhook
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), WebhookController.handleStripeWebhook);

module.exports = router;