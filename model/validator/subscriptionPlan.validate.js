const JOI = require('joi');

module.exports = (SubscriptionPlanModel) => {
    const SubscriptionPlanSchema = JOI.object({
        name: JOI.string().min(3).max(60).required().pattern(/^[a-zA-Z ]+$/).messages({
            "string.empty": "Name is required!",
            "string.min": "Minimum length should be 3",
            "string.max": "Maximum length should be 60",
            "string.pattern.base": "Only alphabets and blank spaces are allowed",
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
        type: JOI.string().required().pattern(/^[a-zA-Z]+$/).messages({
            "string.empty": "Subscription type is required!",
            "string.pattern.base": "Only alphabets are allowed",
        })
    });

    return SubscriptionPlanSchema.validate(SubscriptionPlanModel);
};
