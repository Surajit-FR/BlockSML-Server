const UserModel = require('../../model/user.model');

// DuplicateUserCheck middleware
exports.DuplicateUserCheck = async (req, res, next) => {
    const { email } = req.body;

    try {
        const existingUser = await UserModel.findOne({ email });

        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(409).json({ success: false, message: "Email already exists!", key: "email" });
            }
        }
        next();

    } catch (exc) {
        return res.status(500).json({ success: false, message: exc.message, error: "Something Went Wrong Please Try Again" });
    };
};