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
        SendEmail(userEmail, 'Subscription Created', 'Your subscription has been successfully created.');
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

    SendEmail(updatedEmail, emailSubject, emailMessage);

    if (subscriptionStatus === 'active' && subscriptionUpdated.current_period_end) {
        const subscriptionEndDate = new Date(subscriptionUpdated.current_period_end * 1000);
        scheduleReminder(updatedEmail, subscriptionEndDate);
    };
};

exports.handleCustomerSubscriptionDeleted = async (subscriptionCancel) => {
    const updatedEmail = await fetchCustomerEmail(subscriptionCancel.customer);
    const subscriptionStatus = subscriptionCancel.status;

    let emailSubject = 'Subscription Canceled';
    let emailMessage = 'Your subscription has been canceled.';

    let subscriptionDataToUpdate = {
        'subscription.planId': subscriptionCancel.items.data[0].plan.id || "",
        'subscription.planType': subscriptionCancel.items.data[0].plan.interval || "",
        'subscription.planStartDate': subscriptionCancel.start_date ? new Date(subscriptionCancel.start_date * 1000) : null,
        'subscription.planEndDate': subscriptionCancel.current_period_end ? new Date(subscriptionCancel.current_period_end * 1000) : null,
        'subscription.planDuration': subscriptionCancel.start_date && subscriptionCancel.current_period_end ?
            calculateDurationInDays(subscriptionCancel.start_date * 1000, subscriptionCancel.current_period_end * 1000) :
            null,
        'is_subscribed': subscriptionStatus === 'active'
    };

    if (subscriptionCancel.cancellation_details?.reason === 'cancellation_requested') {
        subscriptionDataToUpdate = {
            ...subscriptionDataToUpdate,
            'subscription.subscriptionId': "",
            'subscription.planId': "",
            'subscription.planType': "",
            'subscription.planStartDate': null,
            'subscription.planEndDate': null,
            'subscription.planDuration': "",
            'is_subscribed': false
        };
        emailSubject = 'Subscription Canceled';
        emailMessage = 'Your subscription has been canceled.';
    }
    SendEmail(updatedEmail, emailSubject, emailMessage);

    await UserModel.findOneAndUpdate(
        { email: updatedEmail },
        subscriptionDataToUpdate
    );
};