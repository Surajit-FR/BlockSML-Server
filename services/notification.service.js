const { SendEmail } = require('../helpers/send_email');

// Function to send reminder email using Node Mailer
exports.sendReminder = (userId, subscriptionEndDate) => {

    const userEmail = 'user@example.com';
    const subject = 'Subscription Reminder';
    const htmlContent = `<p>Your subscription will end on ${subscriptionEndDate.toDateString()}.</p>
               <p>Please renew to continue enjoying our service.</p>`
    SendEmail(userEmail, subject, htmlContent);
};
