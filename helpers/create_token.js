const { secret_key } = require('./secret_key');
const JWT = require('jsonwebtoken');

const CreateToken = (user) => {
    const token = JWT.sign({
        _id: user._id,
        name: user.name,
        email: user.email,
        subscription: user.subscription,
        is_subscribed: user.is_subscribed,
    }, secret_key, { expiresIn: process.env.SESSION_TIME });

    return token;
};

module.exports = CreateToken;