const JOI = require('joi');

module.exports = (PlanDetailModel) => {
    const PlanDetailSchema = JOI.object({
        user: JOI.number().required().messages({
            "any.required": "User is required.",
            "number.base": "User must be a number."
        }),
        subscription: JOI.string().required().messages({
            "string.empty": "A subscription ID is required!",
        }),
        chat_inference: JOI.string().required().messages({
            "any.required": "Chat inference is required.",
            "string.empty": "Chat inference cannot be empty."
        }),
        image_generation: JOI.number().required().messages({
            "any.required": "Image generation is required.",
            "number.base": "Image generation must be a number."
        }),
        youtube_video_summarization: JOI.string().required().messages({
            "any.required": "YouTube video summarization is required.",
            "string.empty": "YouTube video summarization cannot be empty."
        }),
        financial_data_insight_for_stocks: JOI.boolean().required().messages({
            "any.required": "Financial data insight for stocks is required.",
            "boolean.base": "Financial data insight for stocks must be a boolean."
        }),
        news_aggregator_per_day: JOI.number().required().messages({
            "any.required": "News aggregator per day is required.",
            "number.base": "News aggregator per day must be a number."
        }),
    });

    return PlanDetailSchema.validate(PlanDetailModel);
};