const UserModel = require('../model/user.model');
const stripe = require('../config/stripe_config');
const { SendEmail } = require('../helpers/send_email');
const moment = require("moment/moment");
const { scheduleReminder } = require('../services/notification.service');


const fetchCustomerEmail = async (customerId) => {
    try {
        const customer = await stripe.customers.retrieve(customerId);
        return customer.email;
    } catch (error) {
        console.error('Error fetching customer email:', error);
        return null;
    }
};

const calculateDurationInDays = (startDate, endDate) => {
    const start = moment(startDate);
    const end = moment(endDate);
    return end.diff(start, 'days');
};

// Event Handlers
exports.handleCheckoutSessionCompleted = async (checkoutSession) => {
    const userEmail = await fetchCustomerEmail(checkoutSession.customer);
    if (userEmail) {
        const user = await UserModel.findOne({ "subscription.sessionId": checkoutSession.id });
        if (user) {
            const existingSubscriptionId = user.subscription.subscriptionId;
            if (existingSubscriptionId) {
                const existingSubscription = await stripe.subscriptions.retrieve(existingSubscriptionId);
                if (existingSubscription && existingSubscription.status === 'active') {
                    await stripe.subscriptions.update(existingSubscriptionId, {
                        cancel_at_period_end: true,
                    });
                }
            }
            SendEmail(userEmail, 'Subscription Created', 'Your subscription has been successfully created.');
        }
    }
};

exports.handleCheckoutSessionAsyncPaymentFailed = async (checkoutSession) => {
    const userEmail = await fetchCustomerEmail(checkoutSession.customer);
    if (userEmail) {
        const user = await UserModel.findOne({ "subscription.sessionId": checkoutSession.id });
        if (user) {
            const subscriptionId = user.subscription.subscriptionId;
            if (subscriptionId) {
                await stripe.subscriptions.update(subscriptionId, {
                    items: [{
                        id: user.subscription.subscriptionId,
                        price: user.subscription.previous_price,
                    }],
                    proration_behavior: 'none',
                });

                await UserModel.findOneAndUpdate(
                    { "subscription.sessionId": checkoutSession.id },
                    {
                        $set: {
                            "subscription.planId": user.subscription.previous_plan_id,
                            "subscription.planType": user.subscription.previous_plan_type,
                            "subscription.planStartDate": null,
                            "subscription.planEndDate": null,
                            "subscription.planDuration": "",
                            "is_subscribed": false
                        }
                    }
                );
            }
            SendEmail(userEmail, 'Payment Failed', 'Your subscription payment failed. Please try again.');
        }
    }
};

exports.handlePaymentIntentSucceeded = async (paymentIntent) => {
    const succeededEmail = await fetchCustomerEmail(paymentIntent.customer);
    if (succeededEmail) {
        SendEmail(succeededEmail, 'Payment Succeeded', 'Your payment has been successfully processed.');
    }
};

exports.handlePaymentIntentPaymentFailed = async (paymentIntent) => {
    const failedPaymentEmail = await fetchCustomerEmail(paymentIntent.customer);
    if (failedPaymentEmail) {
        console.log('Payment Failed', 'Your payment has failed. Please try again or update your payment method.');
    }
};

exports.handleInvoicePaid = async (invoice) => {
    const paidEmail = await fetchCustomerEmail(invoice.customer);
    if (paidEmail) {
        SendEmail(paidEmail, 'Invoice Paid', 'Your invoice has been paid successfully.');
    }
};

exports.handleInvoicePaymentFailed = async (invoice) => {
    const failedEmail = await fetchCustomerEmail(invoice.customer);
    if (failedEmail) {
        console.log('Invoice Payment Failed', 'Your invoice payment has failed. Please update your payment method.');
    }
};

exports.handleCustomerSubscriptionUpdated = async (subscriptionUpdated) => {
    const updatedEmail = await fetchCustomerEmail(subscriptionUpdated.customer);
    const subscriptionStatus = subscriptionUpdated.status;

    let emailSubject = 'Subscription Updated';
    let emailMessage = 'Your subscription has been updated.';

    let subscriptionDataToUpdate = {
        'subscription.planId': subscriptionUpdated.items.data[0].plan.id || "",
        'subscription.planType': subscriptionUpdated.items.data[0].plan.interval || "",
        'subscription.planStartDate': subscriptionUpdated.start_date ? new Date(subscriptionUpdated.start_date * 1000) : null,
        'subscription.planEndDate': subscriptionUpdated.current_period_end ? new Date(subscriptionUpdated.current_period_end * 1000) : null,
        'subscription.planDuration': subscriptionUpdated.start_date && subscriptionUpdated.current_period_end ?
            calculateDurationInDays(subscriptionUpdated.start_date * 1000, subscriptionUpdated.current_period_end * 1000) :
            null,
        'is_subscribed': subscriptionStatus === 'active'
    };

    const existingUser = await UserModel.findOne({ "subscription.subscriptionId": subscriptionUpdated.id });
    if (existingUser) {
        const currentPlanId = subscriptionUpdated.items.data[0].plan.id;
        const existingPlanId = existingUser.subscription.planId;

        if (subscriptionUpdated.cancellation_details?.reason === 'cancellation_requested') {
            subscriptionDataToUpdate = {
                ...subscriptionDataToUpdate,
                'subscription.subscriptionId': "",
                'subscription.customerId': "",
                'subscription.planStartDate': null,
                'subscription.planEndDate': null,
                'subscription.planDuration': "",
                'is_subscribed': false
            };
            emailSubject = 'Subscription Canceled';
            emailMessage = 'Your subscription has been canceled.';
        } else if (currentPlanId !== existingPlanId) {
            const subscriptionID = existingUser.subscription.subscriptionId;
            const subscription = await stripe.subscriptions.retrieve(subscriptionID);

            const prorationDate = Math.min(
                moment().unix(),
                subscription.current_period_end
            );
            
            await stripe.subscriptions.update(subscriptionID, {
                items: [{
                    id: subscription.items.data[0].id,
                    price: currentPlanId,
                }],
                proration_behavior: 'create_prorations',
                proration_date: prorationDate,
                expand: ['latest_invoice.payment_intent'],
            });

            emailSubject = 'Subscription Plan Updated';
            emailMessage = 'Your subscription plan has been updated.';
        }
    }

    SendEmail(updatedEmail, emailSubject, emailMessage);

    if (subscriptionStatus === 'active' && subscriptionUpdated.current_period_end) {
        const subscriptionEndDate = new Date(subscriptionUpdated.current_period_end * 1000);
        scheduleReminder(updatedEmail, subscriptionEndDate);
    }

    await UserModel.findOneAndUpdate(
        { email: updatedEmail },
        subscriptionDataToUpdate
    );
};