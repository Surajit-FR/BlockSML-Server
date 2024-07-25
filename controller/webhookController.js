const stripe = require("../config/stripe_config");
const {
    handleCheckoutSessionCompleted,
    handleCheckoutSessionAsyncPaymentFailed,
    handlePaymentIntentSucceeded,
    handlePaymentIntentPaymentFailed,
    handleInvoicePaid,
    handleInvoicePaymentFailed,
    handleCustomerSubscriptionUpdated,
    handleCustomerSubscriptionDeleted
} = require("../services/weebhook.service");


// Main Webhook Handler
exports.handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error('Webhook Error:', err.message);
        return res.status(400).json({ success: false, message: 'Webhook Error' });
    }

    switch (event.type) {
        case 'checkout.session.completed':
            await handleCheckoutSessionCompleted(event.data.object);
            break;
        case 'checkout.session.async_payment_failed':
            await handleCheckoutSessionAsyncPaymentFailed(event.data.object);
            break;
        case 'payment_intent.succeeded':
            await handlePaymentIntentSucceeded(event.data.object);
            break;
        case 'payment_intent.payment_failed':
            await handlePaymentIntentPaymentFailed(event.data.object);
            break;
        case 'invoice.paid':
            await handleInvoicePaid(event.data.object);
            break;
        case 'invoice.payment_failed':
            await handleInvoicePaymentFailed(event.data.object);
            break;
        case 'customer.subscription.updated':
            await handleCustomerSubscriptionUpdated(event.data.object);
            break;
        case 'customer.subscription.deleted':
            await handleCustomerSubscriptionDeleted(event.data.object);
            break;
        case 'charge.refund.updated':
            await handleRefundUpdated(event.data.object);
            break;
        default:
            console.warn(`Unhandled event type: ${event.type}`);
    }

    return res.json({ received: true });
};