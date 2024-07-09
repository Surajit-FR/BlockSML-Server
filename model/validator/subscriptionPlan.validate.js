const JOI = require('joi');

module.exports = (SubscriptionPlanModel) => {
    const SubscriptionPlanSchema = JOI.object({
        name: JOI.string().min(3).max(60).required().pattern(/^[a-zA-Z ]+$/).messages({
            "string.empty": "Name is required!",
            "string.min": "Minimum length should be 3",
            "string.max": "Maximum length should be 60",
            "string.pattern.base": "Only alphabets and blank spaces are allowed",
        }),
        stripe_price_id: JOI.string().required().messages({
            "string.empty": "Stripe Price ID is required!",
        }),
        trial_days: JOI.number().integer().min(0).required().messages({
            "number.base": "Trial days must be a number",
            "number.min": "Trial days cannot be negative",
            "any.required": "Trial days are required",
        }),
        is_trial: JOI.boolean().default(false),
        amount: JOI.number().positive().required().messages({
            "number.base": "Amount must be a number",
            "number.positive": "Amount must be positive",
            "any.required": "Amount is required",
        }),
        type: JOI.number().integer().min(0).max(3).required().messages({
            "number.base": "Type must be a number",
            "number.min": "Type must be between 0 and 3",
            "number.max": "Type must be between 0 and 3",
            "any.required": "Type is required",
        })
    });

    return SubscriptionPlanSchema.validate(SubscriptionPlanModel);
};
