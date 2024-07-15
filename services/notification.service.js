const Queue = require('bull');
const redisClient = require('../config/redis');
const UserModel = require('../model/user.model');
const { SendEmail } = require('../helpers/send_email');

const reminderQueue = new Queue('reminder', {
    redis: {
        port: 6379,
        host: '127.0.0.1',
    },
});

reminderQueue.process(async (job) => {
    const { userId, subscriptionEndDate } = job.data;
    sendReminder(userId, subscriptionEndDate);
});

// scheduleReminder
exports.scheduleReminder = async (userEmail, subscriptionEndDate) => {
    try {
        const user = await UserModel.findOne({ email: userEmail });
        const userId = user._id;

        if (user) {
            const reminderDate = new Date(subscriptionEndDate);
            reminderDate.setDate(reminderDate.getDate() - 3); // 3 days before subscription ends

            reminderQueue.add(
                { userId, subscriptionEndDate },
                { delay: reminderDate.getTime() - Date.now() }
            );

            // Store the reminder schedule in Redis
            const reminderKey = `reminder:${userId}`;
            redisClient.set(reminderKey, subscriptionEndDate.toISOString());
        } else {
            console.error(`User not found for userID: ${userId}`);
        }
    } catch (error) {
        console.error('Error fetching user details:', error);
    }
};

// sendReminder
exports.sendReminder = async (userId, subscriptionEndDate) => {
    try {
        const user = await UserModel.findById(userId);

        if (user && user.email) {
            const userEmail = user.email;
            const subject = 'Subscription Reminder';
            const htmlContent = `<p>Your subscription will end on ${new Date(subscriptionEndDate).toDateString()}.</p>
                    <p>Please renew to continue enjoying our service.</p>`;

            SendEmail(userEmail, subject, htmlContent);

            // Optionally, remove the reminder key from Redis after sending the reminder
            const reminderKey = `reminder:${userId}`;
            redisClient.del(reminderKey);
        } else {
            console.error(`User not found or email not available for user ID: ${userId}`);
        }
    } catch (error) {
        console.error('Error fetching user details:', error);
    }
};