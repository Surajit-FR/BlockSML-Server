const JWT = require('jsonwebtoken');
const { secret_key } = require('../../helpers/secret_key');

// VerifyToken
exports.VerifyToken = async (req, res, next) => {
    let token = req.body.token || req.query.token || req.headers["x-access-token"] || req.headers.authorization || req.body.headers?.Authorization;
    try {
        if (!token) {
            return res.status(401).json({ success: false, message: "Token required for authorization", key: "token" });
        };

        if (token?.startsWith('Bearer ')) {
            token = token.slice(7);
        };

        const decoded_token = JWT.verify(token, secret_key);
        // Attach the decoded token to the request object
        req.decoded_token = decoded_token;

        next();

    } catch (exc) {
        return res.status(401).json({ success: false, message: "Session Expired. Please Login !!", error: exc.message });
    };
};