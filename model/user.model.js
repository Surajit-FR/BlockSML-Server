const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubscriptionSchema = new Schema({
    sessionId: { type: String, default: "" },
    planId: { type: String, default: "" },
    planType: { type: String, default: "" },
    planStartDate: { type: Date, default: null },
    planEndDate: { type: Date, default: null },
    planDuration: { type: String, default: "" }
}, { _id: false });

const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    subscription: { type: SubscriptionSchema, default: () => ({}) },
    is_subscribed: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('user', UserSchema);