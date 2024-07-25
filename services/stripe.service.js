const stripe = require('../config/stripe_config');

// createStripeSession
exports.createStripeSession = async (planID, userID, customerID,) => {
    try {
        // Create a new Stripe session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price: planID,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.FRONTEND_HOST}/success/{CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_HOST}/cancel/{CHECKOUT_SESSION_ID}`,
            customer: customerID,
            metadata: {
                userId: userID.toString()
            }
        });

        // Replace the placeholder with the actual session ID
        session.success_url = session.success_url.replace('{CHECKOUT_SESSION_ID}', session.id);
        session.cancel_url = session.cancel_url.replace('{CHECKOUT_SESSION_ID}', session.id);

        return session;

    } catch (error) {
        return { error: error.message };
    };
};