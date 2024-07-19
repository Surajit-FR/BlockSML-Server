const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubscriptionPlanSchema = new Schema({
    name: { type: String, required: true },
    stripe_price_id: { type: String, required: true },
    trial_days: { type: Number, required: true },
    is_trial: { type: Boolean, default: false },
    amount: { type: Number, required: true },
    type: { type: String, required: true },
    user_count: { type: Number, required: true },
    chat_inference: { type: String, required: true },
    image_generation: { type: Number, required: true },
    youtube_video_summarization: { type: String, required: true },
    financial_data_insight_for_stocks: { type: Boolean, required: true },
    news_aggregator_per_day: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('subscription_plan', SubscriptionPlanSchema);
