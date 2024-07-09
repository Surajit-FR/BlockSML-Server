const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubscriptionDetailSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'user' },
    stripe_subscripton_id: { type: String, required: false },
    stripe_subscripton_schedule_id: { type: String, required: false },
    stripe_customer_id: { type: String, required: true },
    subscripton: { type: Schema.Types.ObjectId, ref: 'subscription_plan' },
    plan_amount: { type: Number, required: true },
    plan_amount_currency: { type: String, required: true },
    plan_interval: { type: String, required: false },
    plan_interval_count: { type: Number, required: false },
    created: { type: Date, required: true },
    plan_period_start: { type: Date, required: true },
    plan_period_end: { type: Date, required: true },
    trial_end: { type: Date, default: null },
    status: { type: String, enum: ['active', 'cancelled'], default: null },
    cancel: { type: Boolean, default: false },
    canceled_at: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('subscription_detail', SubscriptionDetailSchema);
