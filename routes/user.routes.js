// GetUserDetail

const express = require('express');
const router = express.Router();
const RequestRate = require('../helpers/request_limiter');
const UserController = require('../controller/user.controller');
const { VerifyToken } = require('../middleware/auth/auth_user');

// GetUserDetails
router.get('/get-user-details', [VerifyToken], UserController.GetUserDetails);
// GetSubscriptionDetails
router.get('/get-subscription-details', [VerifyToken], UserController.GetSubscriptionDetails);
// CancelSubscription
router.post('/cancel-subscription', [RequestRate.Limiter, VerifyToken], UserController.CancelSubscription);


module.exports = router;