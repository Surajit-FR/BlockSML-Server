const stripe = require('../config/stripe_config');

// CreateCheckoutSession
exports.CreateCheckoutSession = async (req, res) => {
    const { product } = req.body;

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: product.subscription.name
                        },
                        unit_amount: product.subscription.amount * 100,
                        recurring: {
                            interval: 'month'
                        }
                    },
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `http://localhost:3000/success`,
            cancel_url: `http://localhost:3000/cancel`,
        });

        return res.status(201).json({ id: session.id });
    } catch (exc) {
        console.log(exc.message);
        return res.status(500).json({ success: false, message: exc.message, error: "Internal Server Error" });
    };
};