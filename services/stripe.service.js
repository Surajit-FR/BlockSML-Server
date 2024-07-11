const stripe = require('../config/stripe_config');

// createStripeSession
exports.createStripeSession = async (planID) => {
    try {
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
        });
        return session;
    } catch (error) {
        return error;
    };
};