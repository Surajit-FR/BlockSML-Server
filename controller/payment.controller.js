const { createStripeSession } = require("../services/stripe.service");
const UserModel = require('../model/user.model');
const SubscriptionPlanModel = require('../model/subscriptionPlan.model');
const stripe = require('../config/stripe_config');
const moment = require("moment/moment");
const CreateToken = require("../helpers/create_token");

// CreateCheckoutSession
exports.CreateCheckoutSession = async (req, res) => {
    const { product } = req.body;

    try {
        const session = await createStripeSession(product.subscription.stripe_price_id);

        const decoded_token = req.decoded_token;
        const userID = decoded_token._id;

        // check the existingUser
        const existingUser = await UserModel.findOne({ _id: userID });
        if (!existingUser) {
            return res.status(404).json({ success: false, message: "User not found!" });
        };

        // Upadate the user with sessionID
        await UserModel.findByIdAndUpdate(
            { _id: userID },
            {
                subscription: {
                    sessionId: session.id,
                },
                is_subscribed: true,
            },
            { new: true }
        );
        return res.status(201).json({ id: session.id });
    } catch (exc) {
        console.log(exc.message);
        return res.status(500).json({ success: false, message: exc.message, error: "Internal Server Error" });
    };
};

// PaymentSuceess
exports.PaymentSuceess = async (req, res) => {

    try {
        const decoded_token = req.decoded_token;
        const userID = decoded_token._id;
        const sessionID = req.body._sessionID;

        const session = await stripe.checkout.sessions.retrieve(sessionID);

        if (session.payment_status === "paid") {
            const subscriptionId = session.subscription;
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);

            console.log({ subscription });

            // check the existingUser
            const existingUser = await UserModel.findOne({ _id: userID });
            if (!existingUser) {
                return res.status(404).json({ success: false, message: "User not found!" });
            };

            const planId = subscription.plan.id;
            const subscriptionPlan = await SubscriptionPlanModel.findOne({ stripe_price_id: planId });

            if (!subscriptionPlan) {
                return res.status(404).json({ success: false, message: "Subscription plan not found!" });
            }

            const planType = subscriptionPlan.type;
            const startDate = moment.unix(subscription.current_period_start).format('YYYY-MM-DD');
            const endDate = moment.unix(subscription.current_period_end).format('YYYY-MM-DD');
            const durationInSeconds = (subscription.current_period_end - subscription.current_period_start);
            const durationInDays = moment.duration(durationInSeconds, 'seconds').asDays();

            // Upadate the user with subscription data
            const USER_DATA = await UserModel.findByIdAndUpdate(
                { _id: userID },
                {
                    subscription: {
                        sessionId: "",
                        planId: planId,
                        planType: planType,
                        planStartDate: startDate,
                        planEndDate: endDate,
                        planDuration: durationInDays,
                    }
                },
                { new: true }
            );
            const tokenData = CreateToken(USER_DATA);
            return res.status(201).json({ success: true, message: "Payment Successfull!", data: USER_DATA, token: tokenData });
        }
    } catch (exc) {
        console.log(exc.message);
        return res.status(500).json({ success: false, message: exc.message, error: "Internal Server Error" });
    };
};