const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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

    // Handle the event based on its type
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('PaymentIntent was successful:', paymentIntent);
            // Handle successful payment intent
            break;
        case 'payment_intent.payment_failed':
            const paymentFailedIntent = event.data.object;
            console.log('PaymentIntent failed:', paymentFailedIntent);
            // Handle failed payment intent
            break;
        case 'invoice.paid':
            const invoice = event.data.object;
            console.log('Invoice paid:', invoice);
            // Handle paid invoice
            break;
        case 'invoice.payment_failed':
            const failedInvoice = event.data.object;
            console.log('Invoice payment failed:', failedInvoice);
            // Handle failed invoice payment
            break;
        // Add more event types as needed
        default:
            console.warn(`Unhandled event type: ${event.type}`);
    }

    // Return a response to acknowledge receipt of the event
    return res.json({ received: true });
};