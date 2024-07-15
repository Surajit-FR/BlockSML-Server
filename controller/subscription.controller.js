const SubscriptionPlanModel = require('../model/subscriptionPlan.model');
const PlanDetailModel = require('../model/planDetails.model');
const stripe = require('../config/stripe_config');

// AddSubscriptionPlan
exports.AddSubscriptionPlan = async (req, res) => {
    const { name, trial_days, is_trial, amount, type } = req.body;

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

        // Create a subscription plan in your database
        const subscriptionPlan = new SubscriptionPlanModel({
            name,
            stripe_price_id: price.id,
            trial_days,
            is_trial,
            amount,
            type
        });

        await subscriptionPlan.save();
        return res.status(201).json({ success: true, message: "New Subscription Plan Added!" });
    } catch (exc) {
        return res.status(500).json({ success: false, message: exc.message });
    };
};

// GetSubscriptionPlans
exports.GetSubscriptionPlans = async (req, res) => {
    try {
        const subscriptionPlanData = await PlanDetailModel.aggregate([
            {
                $lookup: {
                    from: 'subscription_plans',
                    localField: 'subscription',
                    foreignField: '_id',
                    as: 'subscription'
                }
            },
            {
                $unwind: "$subscription"
            }
        ]);
        return res.status(201).json({ success: true, message: "Subscriptions Fetched Successfully!", data: subscriptionPlanData });
    } catch (exc) {
        return res.status(500).json({ success: false, message: exc.message });
    };
};

// GetSubscriptionDetail
exports.GetSubscriptionDetail = async (req, res) => {
    const { plan_id } = req.params;

    try {
        const decoded_token = req.decoded_token;
        const userId = decoded_token._id;

        const subsPlanData = await SubscriptionPlanModel.findOne({ _id: plan_id });
        if (!subsPlanData) {
            return res.status(400).json({ success: false, message: "Plan not found!" });
        };

        var subs_msg = '';
        const userHaveBuyedPlan = await SubscriptionDetailModel.countDocuments({ user: userId });
        if (userHaveBuyedPlan === 0 && subsPlanData.is_trial === true) {
            subs_msg = `You will get ${subsPlanData.trial_days} days trial and after we will charge $${subsPlanData.amount} for ${subsPlanData.name} Subscription Plan.`
        } else {
            subs_msg = `We will charge $${subsPlanData.amount} for ${subsPlanData.name} Subscription Plan.`
        };

        return res.status(201).json({ success: true, message: subs_msg, data: subsPlanData });

    } catch (exc) {
        return res.status(500).json({ success: false, message: exc.message });
    };
};

// AddPlanDetails
exports.AddPlanDetails = async (req, res) => {
    const { user, subscription, chat_inference, image_generation, youtube_video_summarization, financial_data_insight_for_stocks, news_aggregator_per_day } = req.body;

    try {
        const newPlanDetails = new PlanDetailModel({
            user,
            subscription,
            chat_inference,
            image_generation,
            youtube_video_summarization,
            financial_data_insight_for_stocks,
            news_aggregator_per_day
        });
        await newPlanDetails.save();
        return res.status(201).json({ success: true, message: "Plan details added successfully!" });
    } catch (exc) {
        return res.status(500).json({ success: false, message: exc.message });
    };
};