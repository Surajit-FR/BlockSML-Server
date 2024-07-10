const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PlanDetailSchema = new Schema({
    user: { type: Number, required: true },
    subscription: { type: Schema.Types.ObjectId, ref: 'subscription_plan' },
    chat_inference: { type: String, required: true },
    image_generation: { type: Number, required: true },
    youtube_video_summarization: { type: String, required: true },
    financial_data_insight_for_stocks: { type: Boolean, required: true },
    news_aggregator_per_day: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('plan_detail', PlanDetailSchema);
