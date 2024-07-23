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
        const decoded_token = req.decoded_token;
        const userID = decoded_token._id;
        const planID = product.stripe_price_id;
        let customerID = decoded_token.subscription.customerId;

        // Check the existing user
        const existingUser = await UserModel.findOne({ _id: userID });
        if (!existingUser) {
            return res.status(404).json({ success: false, message: "User not found!" });
        };

        // Create a new Stripe customer if customerId is not present
        if (!customerID) {
            const customer = await stripe.customers.create({
                email: existingUser.email,
                name: existingUser.name,
                metadata: { userId: userID }
            });
            customerID = customer.id;
        }

        // Now create the Stripe checkout session
        const session = await createStripeSession(planID, userID);

        if (session.error) {
            return res.status(409).json({ success: false, message: session.error });
        }

        // Update the user with sessionID
        await UserModel.findByIdAndUpdate(
            { _id: userID },
            {
                subscription: {
                    sessionId: session.id,
                }
            },
            { new: true }
        );

        return res.status(201).json({ id: session.id });
    } catch (exc) {
        console.log(exc.message);
        return res.status(500).json({ success: false, message: exc.message, error: "Internal Server Error" });
    }
};

// PaymentSuceess
exports.PaymentSuceess = async (req, res) => {
    try {
        const decoded_token = req.decoded_token;
        const userID = decoded_token._id;
        const sessionID = req.body._sessionID;

        // const session = await stripe.checkout.sessions.retrieve(sessionID, { expand: ['subscription', 'customer'] });
        const session = await stripe.checkout.sessions.retrieve(sessionID);
        
        const subscriptionId = session?.subscription;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const planId = subscription.plan.id;

        // check the existingUser
        const existingUser = await UserModel.findOne({ _id: userID });
        if (!existingUser) {
            return res.status(404).json({ success: false, message: "User not found!" });
        };

        if (session.payment_status === "paid") {
            const subscriptionPlan = await SubscriptionPlanModel.findOne({ stripe_price_id: planId });

            if (!subscriptionPlan) {
                return res.status(404).json({ success: false, message: "Subscription plan not found!" });
            };

            const customerId = subscription.customer;
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
                        subscriptionId: subscription.id,
                        customerId: customerId,
                        sessionId: "",
                        planId: planId,
                        planType: planType,
                        planStartDate: startDate,
                        planEndDate: endDate,
                        planDuration: durationInDays,
                    },
                    is_subscribed: true,
                },
                { new: true }
            );
            const tokenData = CreateToken(USER_DATA);
            return res.status(201).json({ success: true, message: "Payment Successfull!", data: USER_DATA, token: tokenData });
        } else if (session.payment_status === "unpaid") {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const currentItemId = subscription.items.data[0].id;

            await stripe.subscriptions.update(subscriptionId, {
                items: [{
                    id: currentItemId,
                    price: planId,
                }],
                proration_behavior: 'none',
            });

            await UserModel.findByIdAndUpdate(
                { _id: userID },
                {
                    $set: {
                        "subscription.subscriptionId": existingUser.subscription.subscriptionId,
                        "subscription.customerId": existingUser.subscription.customerId,
                        "subscription.sessionId": existingUser.subscription.sessionId,
                        "subscription.planId": existingUser.subscription.planId,
                        "subscription.planType": existingUser.subscription.planType,
                        "subscription.planStartDate": existingUser.subscription.planStartDate,
                        "subscription.planEndDate": existingUser.subscription.planEndDate,
                        "subscription.planDuration": existingUser.subscription.planDuration,
                        "is_subscribed": existingUser.subscription.is_subscribed,
                    }
                }
            );
        }
    } catch (exc) {
        console.log(exc.message);
        return res.status(500).json({ success: false, message: exc.message, error: "Internal Server Error" });
    };
};

// BillingPortal
exports.BillingPortal = async (req, res) => {
    try {
        const decoded_token = req.decoded_token;
        const customerId = decoded_token.subscription.customerId;

        if (!customerId) {
            return res.status(400).json({ success: true, message: "You don't have any subscription to view. Please add one!" });
        };

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${process.env.HOST}:${process.env.FRONTEND_PORT}/profile`
        });

        return res.status(201).json({ success: true, message: "New billing portal session created!", data: portalSession })

    } catch (exc) {
        console.log(exc.message);
        return res.status(500).json({ success: false, message: exc.message, error: "Internal Server Error" });
    };
};

// Update Subscription
exports.UpdateSubscription = async (req, res) => {
    const { product } = req.body;
    const newPlanID = product.stripe_price_id;

    try {
        const decoded_token = req.decoded_token;
        const userID = decoded_token._id;

        // Check the existing user
        const existingUser = await UserModel.findOne({ _id: userID });
        if (!existingUser || !existingUser.subscription || !existingUser.subscription.subscriptionId) {
            return res.status(404).json({ success: false, message: "User or subscription not found!" });
        }

        const subscriptionID = existingUser.subscription.subscriptionId;

        // Retrieve the current subscription
        const subscription = await stripe.subscriptions.retrieve(subscriptionID);

        // Calculate proration for the upgrade
        const prorationDate = Math.min(
            moment().unix(),
            subscription.current_period_end
        );

        // Update the subscription with proration
        const updatedSubscription = await stripe.subscriptions.update(subscriptionID, {
            items: [{
                id: subscription.items.data[0].id,
                price: newPlanID,
            }],
            proration_behavior: 'create_prorations',
            proration_date: prorationDate,
            expand: ['latest_invoice.payment_intent'],
        });

        // Now create the Stripe checkout session
        const session = await createStripeSession(newPlanID, userID);

        if (session.error) {
            await stripe.subscriptions.update(subscriptionID, {
                items: [{
                    id: updatedSubscription.items.data[0].id,
                    price: subscription.items.data[0].price.id,
                }],
                proration_behavior: 'none',
            });
            return res.status(409).json({ success: false, message: session.error });
        };

        await UserModel.findByIdAndUpdate(
            { _id: userID },
            {
                $set: {
                    "subscription.sessionId": session.id,
                }
            },
            { new: true }
        );

        return res.status(200).json({ success: true, sessionId: session.id });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, message: error.message });
    };
};