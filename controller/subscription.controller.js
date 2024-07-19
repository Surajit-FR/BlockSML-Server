const SubscriptionPlanModel = require('../model/subscriptionPlan.model');
const stripe = require('../config/stripe_config');

// AddSubscriptionPlan
exports.AddSubscriptionPlan = async (req, res) => {
    const {
        name,
        trial_days,
        is_trial,
        amount,
        type,
        user_count,
        chat_inference,
        image_generation,
        youtube_video_summarization,
        financial_data_insight_for_stocks,
        news_aggregator_per_day
    } = req.body;

    try {
        // Create a product in Stripe
        const product = await stripe.products.create({
            name: name,
            type: 'service',
        });

        // Create a price in Stripe
        const price = await stripe.prices.create({
            unit_amount: amount * 100,
            currency: 'usd',
            recurring: {
                interval: type, // "day", "week", "month" or "year"
            },
            product: product.id,
        });

        // Create a subscription plan with details in your database
        const subscriptionPlanWithDetails = new SubscriptionPlanModel({
            name,
            stripe_price_id: price.id,
            trial_days,
            is_trial,
            amount,
            type,
            user_count,
            chat_inference,
            image_generation,
            youtube_video_summarization,
            financial_data_insight_for_stocks,
            news_aggregator_per_day
        });

        await subscriptionPlanWithDetails.save();
        return res.status(201).json({ success: true, message: "New Subscription Plan with Details Added!" });
    } catch (exc) {
        return res.status(500).json({ success: false, message: exc.message });
    };
};

// GetSubscriptionPlans
exports.GetSubscriptionPlans = async (req, res) => {
    try {
        const subscriptionPlanData = await SubscriptionPlanModel.find({});
        return res.status(201).json({ success: true, message: "Subscriptions Fetched Successfully!", data: subscriptionPlanData });
    } catch (exc) {
        return res.status(500).json({ success: false, message: exc.message });
    };
};