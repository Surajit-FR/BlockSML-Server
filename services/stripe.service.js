const stripe = require('../config/stripe_config');

// Check if the user has an active subscription
const getActiveSubscription = async (customerID) => {
    const subscriptions = await stripe.subscriptions.list({
        customer: customerID,
        status: 'active'
    });

    return subscriptions.data.length > 0 ? subscriptions.data[0] : null;
};

// createStripeSession
exports.createStripeSession = async (planID, userID, customerID) => {
    try {
        // Check for an active subscription
        const activeSubscription = await getActiveSubscription(customerID);

        if (activeSubscription?.plan?.active) {
            // Handle the case where there is already an active subscription
            return {
                error: 'You already have an active subscription.',
                subscription: activeSubscription
            };
        }

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
            success_url: `${process.env.HOST}:${process.env.FRONTEND_PORT}/success`,
            cancel_url: `${process.env.HOST}:${process.env.FRONTEND_PORT}/cancel`,
            metadata: {
                userId: userID.toString()
            }
        });

        return session;

    } catch (error) {
        return { error: error.message };
    }
};