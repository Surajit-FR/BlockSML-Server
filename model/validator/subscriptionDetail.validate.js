const JOI = require('joi');

module.exports = (SubscriptionDetailModel) => {
    const SubscriptionDetailSchema = JOI.object({
        user: JOI.string().required().messages({
            "string.empty": "User ID is required!",
            "any.required": "User ID is required!",
        }),
        stripe_subscription_id: JOI.string().allow(null, '').messages({
            "string.empty": "Stripe Subscription ID cannot be empty!",
        }),
        stripe_subscription_schedule_id: JOI.string().allow(null, '').messages({
            "string.empty": "Stripe Subscription Schedule ID cannot be empty!",
        }),
        stripe_customer_id: JOI.string().required().messages({
            "string.empty": "Stripe Customer ID is required!",
            "any.required": "Stripe Customer ID is required!",
        }),
        subscription: JOI.string().required().messages({
            "string.empty": "Subscription Plan ID is required!",
            "any.required": "Subscription Plan ID is required!",
        }),
        plan_amount: JOI.number().positive().required().messages({
            "number.base": "Plan amount must be a number",
            "number.positive": "Plan amount must be positive",
            "any.required": "Plan amount is required",
        }),
        plan_amount_currency: JOI.string().min(3).max(3).required().messages({
            "string.empty": "Plan amount currency is required!",
            "string.min": "Plan amount currency must be 3 characters",
            "string.max": "Plan amount currency must be 3 characters",
            "any.required": "Plan amount currency is required!",
        }),
        plan_interval: JOI.string().allow(null, '').messages({
            "string.empty": "Plan interval cannot be empty!",
        }),
        plan_interval_count: JOI.number().integer().allow(null, '').messages({
            "number.base": "Plan interval count must be a number",
            "number.integer": "Plan interval count must be an integer",
        }),
        created: JOI.date().required().messages({
            "date.base": "Created date must be a valid date",
            "any.required": "Created date is required",
        }),
        plan_period_start: JOI.date().required().messages({
            "date.base": "Plan period start date must be a valid date",
            "any.required": "Plan period start date is required",
        }),
        plan_period_end: JOI.date().required().messages({
            "date.base": "Plan period end date must be a valid date",
            "any.required": "Plan period end date is required",
        }),
        trial_end: JOI.date().allow(null).default(null).messages({
            "date.base": "Trial end date must be a valid date",
        }),
        status: JOI.string().valid('active', 'cancelled').allow(null).default(null).messages({
            "string.empty": "Status cannot be empty",
            "any.only": "Status must be one of 'active' or 'cancelled'",
        }),
        cancel: JOI.boolean().default(false),
        canceled_at: JOI.date().allow(null).default(null).messages({
            "date.base": "Canceled at date must be a valid date",
        }),
    });
    return SubscriptionDetailSchema.validate(SubscriptionDetailModel);
};
