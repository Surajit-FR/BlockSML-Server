const UserModel = require('../model/user.model');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// handleStripeWebhook
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
        case 'checkout.session.completed':
            const checkoutSession = event.data.object;
            // Handle checkout session
            break;
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            // Handle successful payment intent
            break;
        case 'payment_intent.payment_failed':
            const paymentFailedIntent = event.data.object;
            // Handle failed payment intent
            break;
        case 'invoice.paid':
            const invoice = event.data.object;
            // Handle paid invoice
            break;
        case 'invoice.payment_failed':
            const failedInvoice = event.data.object;
            // Handle failed invoice payment
            break;
        case 'customer.subscription.updated':
            const subscriptionUpdated = event.data.object;
            const customerId = event.data.object.customer;


            if (subscriptionUpdated.cancellation_details.reason === "cancellation_requested") {
                // const user = await UserModel.findOne({ 'subscription.customerId': customerId });
                // if (!user) {
                //     throw new Error('User not found');
                // }
                // user.subscription.customerId = "";
                // await user.save();
            } else if (subscriptionUpdated.cancellation_details.reason === null) {
                // const user = await UserModel.findOne({ 'subscription.customerId': customerId });
                // if (!user) {
                //     throw new Error('User not found');
                // }
                // user.subscription.customerId = customerId;
                // await user.save();

            };
            break;
        default:
            console.warn(`Unhandled event type: ${event.type}`);
    }

    // Return a response to acknowledge receipt of the event
    return res.json({ received: true });
};