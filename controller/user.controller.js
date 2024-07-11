const UserModel = require("../model/user.model");

// GetUserDetails
exports.GetUserDetails = async (req, res) => {
    try {
        const decoded_token = req.decoded_token;
        const userId = decoded_token._id;

        const existingUser = await UserModel.findOne({ _id: userId });
        if (!existingUser) {
            return res.status(400).json({ success: false, message: "User not found!" });
        };

        return res.status(200).json({ success: true, message: "User data fetched sucessfully!", data: existingUser });
    } catch (exc) {
        return res.status(500).json({ success: false, message: exc.message });
    };
};