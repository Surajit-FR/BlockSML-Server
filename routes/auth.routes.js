const express = require('express');
const router = express.Router();
const RequestRate = require('../helpers/request_limiter');
const ModelAuth = require('../middleware/auth/model_auth');
const { HandleRegularLoginError } = require('../middleware/auth/creds_validation');
const { DuplicateUserCheck } = require('../middleware/auth/duplicate_check');
const AuthController = require('../controller/auth/auth.controller');
const ValidateUser = require('../model/validator/user.validate');

/**************************************************** ADMIN AUTH ROUTES ****************************************************/

// Sign-Up
router.post('/register', [RequestRate.Limiter, ModelAuth(ValidateUser), DuplicateUserCheck], AuthController.RegisterRegular);
// Login
router.post('/login', [RequestRate.Limiter, HandleRegularLoginError], AuthController.LoginRegular);


module.exports = router;