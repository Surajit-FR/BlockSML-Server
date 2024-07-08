const { findUserByCredential } = require('../../helpers/find_user_by_credential');
const bcrypt_js = require('bcryptjs');
const UserModel = require('../../model/user.model');


// HandleRegularLoginError
exports.HandleRegularLoginError = async (req, res, next) => {
    const { credential, password } = req.body;
    try {
        if (!credential || !password) {
            return res.status(400).send({
                success: false,
                message: !credential ? 'Email is required!' : 'Password is required!',
                key: !credential ? 'credential' : 'password'
            });
        }

        const user = await findUserByCredential(credential);

        if (!user) {
            return res.status(404).send({ success: false, message: "Account not found. Double-check your credential.", key: 'user' });
        }

        // Need to keep 'await' before bcrypt_js.compare()
        if (!(await bcrypt_js.compare(password, user.password))) {
            return res.status(401).send({ success: false, message: 'Incorrect password.', key: 'password' });
        }

        if (user.is_delete === true) {
            return res.status(403).json({ success: false, message: 'Your account has been deleted. Please contact support for further assistance.', key: 'user' });
        }

        // If user is found and either auth_type is social or password matches, proceed to the next middleware
        req.user = user; // Attach user object to the request
        next();

    } catch (exc) {
        return res.status(500).json({ success: false, message: exc.message, error: "Something Went Wrong Please Try Again" });
    };
};

// CheckUser
exports.CheckUser = async (req, res, next) => {
    const { user_type } = req.body;
    try {

        const user = await UserModel.findById({ _id: req.user._id })
            .populate({
                path: 'role',
                populate: {
                    path: 'permissions',
                    select: '-_id -description -createdAt -updatedAt -__v'
                },
                select: '-_id -createdAt -updatedAt -__v -role.permissions'
            })
            .exec();

        if (user_type !== user.role.name) {
            return res.status(403).json({ success: false, message: "Invalid user!", key: "user" });
        }

        next();
    } catch (exc) {
        return res.status(500).json({ success: false, message: exc.message, error: "Internal server error" });
    };
};