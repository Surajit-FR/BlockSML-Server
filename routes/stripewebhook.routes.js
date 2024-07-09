// stripeWebhook.js
const express = require('express');
const WebhookController = require('../controller/webhookController');

const stripeApp = express.Router();
stripeApp.use(express.raw({ type: "*/*" }));
stripeApp.post('/', express.raw({ type: 'application/json' }), WebhookController.handleStripeWebhook);

module.exports = stripeApp;