const { secret_key } = require('./secret_key');
const JWT = require('jsonwebtoken');

const CreateToken = (user) => {
    const token = JWT.sign({
        _id: user._id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        password: user.password,
        role: user.role,
        address: user.address,
        web_theme: user.web_theme,
        remember_me: user.remember_me,
        is_active: user.is_active,
        is_delete: user.is_delete,
    }, secret_key, { expiresIn: process.env.SESSION_TIME });

    return token;
};

module.exports = CreateToken;