const stripe = require("../config/stripe_config");
const CreateToken = require("../helpers/create_token");
const UserModel = require("../model/user.model");

// GetUserDetails
exports.GetUserDetails = async (req, res) => {
    try {
        const decoded_token = req.decoded_token;
        const userId = decoded_token._id;

        const existingUser = await UserModel.findOne({ _id: userId });
        if (!existingUser) {
            return res.status(400).json({ success: false, message: "User not found!" });
        };

        return res.status(200).json({ success: true, message: "User data fetched sucessfully!", data: existingUser });
    } catch (exc) {
        return res.status(500).json({ success: false, message: exc.message });
    };
};

// GetSubscriptionDetails
exports.GetSubscriptionDetails = async (req, res) => {
    try {
        const decoded_token = req.decoded_token;
        const customerId = decoded_token.subscription.customerId;

        // Retrieve subscriptions separately
        const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            limit: 1
        });

        const subscription = subscriptions.data[0];
        if (!subscription) {
            return res.status(404).json({ message: 'No subscription found for this customer.' });
        }

        // Retrieve plan details
        const plan = await stripe.plans.retrieve(subscription.plan.id);

        // Retrieve product details
        const product = await stripe.products.retrieve(plan.product);

        const data = {
            subscription,
            plan,
            product
        };

        return res.status(200).json({ success: true, message: "Data fetched successfully!", data: data });
    } catch (exc) {
        return res.status(500).json({ success: false, message: exc.message });
    }
};

// CancelSubscription
exports.CancelSubscription = async (req, res) => {
    try {
        const decoded_token = req.decoded_token;
        const subscriptionId = decoded_token.subscription.subscriptionId;

        // Check if subscriptionId is valid before attempting to cancel
        if (!subscriptionId) {
            return res.status(400).json({ success: false, message: 'Subscription ID is missing or invalid.' });
        }

        // Cancel the subscription
        const canceledSub = await stripe.subscriptions.cancel(subscriptionId);

        if (!canceledSub || canceledSub.status !== 'canceled') {
            // If subscription was not canceled successfully
            return res.status(400).json({ success: false, message: 'Subscription is already canceled or cannot be canceled.' });
        }

        // Update the user with canceled subscription details
        const updatedUser = await UserModel.findByIdAndUpdate(
            { _id: decoded_token._id },
            {
                $set: {
                    is_subscribed: false,
                    "subscription.sessionId": "",
                    "subscription.planId": "",
                    "subscription.planType": "",
                    "subscription.planStartDate": null,
                    "subscription.planEndDate": null,
                    "subscription.planDuration": "",
                }
            },
            { new: true }
        );
        const tokenData = CreateToken(updatedUser);
        return res.status(200).json({ success: true, message: 'Subscription canceled successfully.', data: updatedUser, token: tokenData });
    } catch (exc) {
        return res.status(500).json({ success: false, message: exc.message });
    }
};