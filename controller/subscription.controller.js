const SubscriptionPlanModel = require('../model/subscriptionPlan.model');
const SubscriptionDetailModel = require('../model/subscriptionDetail.model');

// AddSubscriptionPlan
exports.AddSubscriptionPlan = async (req, res) => {
    const { name, stripe_price_id, trial_days, is_trial, amount, type } = req.body;

    try {
        const subscriptionPlan = new SubscriptionPlanModel({
            name,
            stripe_price_id,
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
        const subscriptionPlanData = await SubscriptionPlanModel.find({});
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