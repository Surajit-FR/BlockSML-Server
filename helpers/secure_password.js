const BcryptJS = require('bcryptjs');

const SecurePassword = async (password) => {
    const HashPassword = await BcryptJS.hash(password, 13);
    return HashPassword;
};

module.exports = SecurePassword;