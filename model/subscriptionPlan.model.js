const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubscriptionPlanSchema = new Schema({
    name: { type: String, required: true },
    stripe_price_id: { type: String, required: true },
    trial_days: { type: Number, required: true },
    is_trial: { type: Boolean, default: false },
    amount: { type: Number, required: true },
    type: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('subscription_plan', SubscriptionPlanSchema);
