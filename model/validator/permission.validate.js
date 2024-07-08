const JOI = require('joi');

module.exports = (PermissionModel) => {
    const UserSchema = JOI.object({
        name: JOI.string().required().pattern(/^[a-z_*]+$/).messages({
            "string.empty": "A name is required!",
            "string.pattern.base": "Only lower case alphabets and '_' are allowed",
        }),
        description: JOI.allow('').optional(),
    })

    return UserSchema.validate(PermissionModel);
};