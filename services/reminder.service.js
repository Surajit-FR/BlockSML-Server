// reminderService.js
const Queue = require('bull');
const reminderQueue = new Queue('reminder', 'redis://127.0.0.1:6379');
const { sendReminder } = require('./notification.service');

reminderQueue.process(async (job) => {
    const { userId, subscriptionEndDate } = job.data;
    sendReminder(userId, subscriptionEndDate);
});

exports.scheduleReminder = (userId, subscriptionEndDate) => {
    const reminderDate = new Date(subscriptionEndDate);
    reminderDate.setDate(reminderDate.getDate() - 3); // 3 days before subscription ends

    reminderQueue.add(
        { userId, subscriptionEndDate },
        { delay: reminderDate.getTime() - Date.now() }
    );
};
