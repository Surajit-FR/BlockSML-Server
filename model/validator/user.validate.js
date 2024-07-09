const JOI = require('joi');

module.exports = (UserModel) => {
    const UserSchema = JOI.object({
        name: JOI.string().min(3).max(60).required().pattern(/^[a-zA-Z ]+$/).messages({
            "string.empty": "Full name is required!",
            "string.min": "Minimum length should be 3",
            "string.max": "Maximum length should be 60",
            "string.pattern.base": "Only alphabets and blank spaces are allowed",
        }),
        email: JOI.string().min(3).max(60).required().email({ minDomainSegments: 1, maxDomainSegments: 2, tlds: { allow: ['com', 'co', 'in'] } }).pattern(/^[a-zA-Z0-9._%+-]+(@[a-zA-Z0-9.-]{5,})+\.[a-zA-Z]{2,}$/).messages({
            "string.empty": "Email ID is required !!",
            "string.min": "Email ID should be minimum 3 characters long !!",
            "string.max": "Email ID should be maximum 60 characters long !!",
            "string.email": "Invalid email format !!",
            "string.pattern.base": "Invalid email format !!",
        }),
        password: JOI.string().min(8).max(16).required().pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])([a-zA-Z0-9@#\$%\^\&*\)\(+=._-]){8,}$/).messages({
            "string.empty": "Password is required !!",
            "string.min": "Password should be minimum 8 characters long !!",
            "string.max": "Password should be maximum 16 characters long !!",
            "string.pattern.base": "Password must contain at least one uppercase letter, one lowercase letter, one number & one special character !!",
        }),
        is_subscribed: JOI.boolean().default(false),
    })

    return UserSchema.validate(UserModel);
};