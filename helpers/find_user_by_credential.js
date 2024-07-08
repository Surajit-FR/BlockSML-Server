const UserModel = require('../model/user.model'); // Assuming UserModel is imported

exports.findUserByCredential = async (credential) => {
    let user;

    // Check if the credential is in email format
    if ((/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/).test(credential)) {
        user = await UserModel.findOne({ email: credential });
    }
    // Check if the credential is in phone format
    else if ((/^[0-9]{10}$/).test(credential)) {
        user = await UserModel.findOne({ phone: credential });
    };

    return user;
};
