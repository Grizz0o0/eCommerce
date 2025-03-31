'use strict';

const express = require('express');
const accessController = require('../../controller/access.controller');
const asyncHandler = require('../../helpers/asyncHandler');
const { authentication, authenticationV2 } = require('../../auth/authUtils');
const router = express.Router();

// signUp
router.post('/shop/signup', asyncHandler(accessController.signUp));
router.post('/shop/login', asyncHandler(accessController.login));

// authenticationV2
router.post(
    '/shop/handlerRefreshToken',authenticationV2,
    asyncHandler(accessController.handlerRefreshToken)
);

// authentication
router.use(authentication);

//////////////////////////////////////////////////
router.get('/shop/me', asyncHandler(accessController.getMe));
router.post('/shop/logout', asyncHandler(accessController.logout));


module.exports = router;
