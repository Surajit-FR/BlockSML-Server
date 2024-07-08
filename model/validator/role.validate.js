const JOI = require('joi');

module.exports = (RoleModel) => {
    const RoleSchema = JOI.object({
        name: JOI.string().required().pattern(/^[a-zA-Z]+$/).messages({
            "string.empty": "A name is required!",
            "string.pattern.base": "Only alphabets are allowed",
        }),
        permissions: JOI.array().items(JOI.string().hex().length(24)).required().messages({
            "any.required": "Permissions are required !!",
            "array.base": "Permissions must be an array !!",
            "array.includesRequiredUnknowns": "Permission array must contain valid ObjectId strings !!",
            "string.hex": "Invalid ObjectId format !!",
            "string.length": "Invalid ObjectId length !!",
        }),
    })

    return RoleSchema.validate(RoleModel);
};