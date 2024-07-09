const UserModel = require('../../model/user.model');
const SecurePassword = require('../../helpers/secure_password');
const CreateToken = require('../../helpers/create_token');


// LoginRegular
exports.LoginRegular = async (req, res) => {
    try {
        // Accessing the user object attached by the middleware 
        const _user = req.user;

        const USER_DATA = await UserModel.findById(_user._id).exec();
        const tokenData = CreateToken(USER_DATA);
        return res.status(200).json({ success: true, message: "Login Successful!", data: USER_DATA, token: tokenData });
    } catch (exc) {
        return res.status(500).json({ success: false, message: exc.message, error: "Internal server error" });
    };
};

// RegisterRegular
exports.RegisterRegular = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const HashedPassword = await SecurePassword(password);
        const NewUser = await UserModel({
            name,
            email: email.toLowerCase(),
            password: HashedPassword,
        });

        const userData = await NewUser.save();
        const USER_DATA = { ...userData._doc };
        const tokenData = CreateToken(USER_DATA);
        return res.status(201).json({ success: true, message: "Registered Successfully!", data: USER_DATA, token: tokenData });
    } catch (exc) {
        return res.status(500).json({ success: false, message: exc.message, error: "Internal server error" });
    };
};