const rate_limit = require('express-rate-limit');

exports.Limiter = rate_limit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60, // limit each window IP to 60 req/min
    message: "Too many requests. Please try again after sometime :(", // Default HTML message
    trustProxy: true,
    keyGenerator: (req) => req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
});