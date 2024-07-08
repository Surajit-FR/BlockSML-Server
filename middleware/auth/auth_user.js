const JWT = require('jsonwebtoken');
const { secret_key } = require('../../helpers/secret_key');
const UserModel = require('../../model/user.model');
const { deleteUploadedFiles } = require('../../helpers/delete_file');

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
        // Delete uploaded file if an error occurred during upload
        deleteUploadedFiles(req);
        return res.status(401).json({ success: false, message: "Session Expired. Please Login !!", error: exc.message });
    };
};

// Authorize
exports.Authorize = (permissions) => {
    return async (req, res, next) => {
        try {
            const decoded_token = req.decoded_token;
            const user = await UserModel.findById({ _id: decoded_token._id })
                .populate({
                    path: 'role',
                    populate: {
                        path: 'permissions',
                        select: '-_id -description -createdAt -updatedAt -__v'
                    },
                    select: '-_id -createdAt -updatedAt -__v -role.permissions'
                })
                .exec();

            if (!user) {
                return res.status(401).json({ success: false, message: 'User not found' });
            }

            const userPermissions = user.role.permissions.map(permission => permission.name);
            // Check if user has "*" permission or any of the specific permissions required by the route
            const hasPermission = permissions.some(permission => userPermissions.includes('*') || userPermissions.includes(permission));

            if (hasPermission) {
                req.user = user;
                if (user.role.name === "SuperAdmin") {
                    return next();
                };
            };

            return res.status(403).json({ success: false, message: 'Permissions denied' });

        } catch (exc) {
            // Delete uploaded file if an error occurred during upload
            deleteUploadedFiles(req);
            return res.status(500).json({ success: false, message: exc.message, error: "Internal server error" });
        }
    };
};