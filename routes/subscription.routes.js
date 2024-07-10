
const express = require('express');
const router = express.Router();
const RequestRate = require('../helpers/request_limiter');
const SubscriptionController = require('../controller/subscription.controller');
const { VerifyToken } = require('../middleware/auth/auth_user');
const ModelAuth = require('../middleware/auth/model_auth');
const ValidateSubscriptionPlan = require('../model/validator/subscriptionPlan.validate');
const ValidatePlanDetails = require('../model/validator/planDetail.validate');

// AddSubscriptionPlan
router.post('/add-subscription-plan', [RequestRate.Limiter, ModelAuth(ValidateSubscriptionPlan)], SubscriptionController.AddSubscriptionPlan);
// GetSubscriptionPlans
router.get('/get-subscription-plans', [RequestRate.Limiter, VerifyToken], SubscriptionController.GetSubscriptionPlans);
// GetSubscriptionDetail
router.get('/get-subscription-detail/:plan_id', [RequestRate.Limiter, VerifyToken], SubscriptionController.GetSubscriptionDetail);
// AddPlanDetails
router.post('/add-plan-details', [RequestRate.Limiter, ModelAuth(ValidatePlanDetails)], SubscriptionController.AddPlanDetails);


module.exports = router;