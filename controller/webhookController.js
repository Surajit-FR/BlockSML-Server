const UserModel = require('../model/user.model');
const stripe = require('../config/stripe_config');
const { SendEmail } = require('../helpers/send_email');
const moment = require("moment/moment");
const { scheduleReminder } = require('../services/notification.service');

// handleStripeWebhook
exports.handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error('Webhook Error:', err.message);
        return res.status(400).json({ success: false, message: 'Webhook Error' });
    };

    const fetchCustomerEmail = async (customerId) => {
        try {
            const customer = await stripe.customers.retrieve(customerId);
            return customer.email;
        } catch (error) {
            console.error('Error fetching customer email:', error);
            return null;
        }
    };

    // Function to calculate duration in days
    const calculateDurationInDays = (startDate, endDate) => {
        const start = moment(startDate);
        const end = moment(endDate);
        return end.diff(start, 'days');
    };

    // Handle the event based on its type
    if (event.type === 'checkout.session.completed') {
        const checkoutSession = event.data.object;
        const userEmail = await fetchCustomerEmail(checkoutSession.customer);
        if (userEmail) {
            SendEmail(userEmail, 'Subscription Created', 'Your subscription has been successfully created.');
        }
    } else if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const succeededEmail = await fetchCustomerEmail(paymentIntent.customer);
        if (succeededEmail) {
            SendEmail(succeededEmail, 'Payment Succeeded', 'Your payment has been successfully processed.');
        }
    } else if (event.type === 'payment_intent.payment_failed') {
        const failedPaymentIntent = event.data.object;
        const failedPaymentEmail = await fetchCustomerEmail(failedPaymentIntent.customer);
        if (failedPaymentEmail) {
            console.log('Payment Failed', 'Your payment has failed. Please try again or update your payment method.');
        }
    } else if (event.type === 'invoice.paid') {
        const invoice = event.data.object;
        const paidEmail = await fetchCustomerEmail(invoice.customer);
        if (paidEmail) {
            SendEmail(paidEmail, 'Invoice Paid', 'Your invoice has been paid successfully.');
        }
    } else if (event.type === 'invoice.payment_failed') {
        const failedInvoice = event.data.object;
        const failedEmail = await fetchCustomerEmail(failedInvoice.customer);
        if (failedEmail) {
            console.log('Invoice Payment Failed', 'Your invoice payment has failed. Please update your payment method.');
        }
    } else if (event.type === 'customer.subscription.updated') {
        const subscriptionUpdated = event.data.object;
        const updatedEmail = await fetchCustomerEmail(subscriptionUpdated.customer);
        // Determine the subscription status
        const subscriptionStatus = subscriptionUpdated.status;

        // Prepare default email subject and message
        let emailSubject = 'Subscription Updated';
        let emailMessage = 'Your subscription has been updated.';

        // Update user subscription data based on status
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

        // Adjust subscription data and email message based on status
        if (subscriptionUpdated.cancellation_details.reason === 'cancellation_requested') {
            subscriptionDataToUpdate = {
                ...subscriptionDataToUpdate,
                'subscription.planStartDate': null,
                'subscription.planEndDate': null,
                'subscription.planDuration': "",
                'is_subscribed': false
            };
            emailSubject = 'Subscription Canceled';
            emailMessage = 'Your subscription has been canceled.';
        }
        // Send email notification
        SendEmail(updatedEmail, emailSubject, emailMessage);
        // Schedule a reminder for subscription end date
        if (subscriptionStatus === 'active' && subscriptionUpdated.current_period_end) {
            const subscriptionEndDate = new Date(subscriptionUpdated.current_period_end * 1000);
            scheduleReminder(updatedEmail, subscriptionEndDate);
        }


        // Update user model
        await UserModel.findOneAndUpdate(
            { email: updatedEmail },
            subscriptionDataToUpdate
        );
    } else {
        console.warn(`Unhandled event type: ${event.type}`);
    };

    // Return a response to acknowledge receipt of the event
    return res.json({ received: true });
};