'use strict';

const AccessService = require('../services/access.service');
const { OK, CREATED, SuccessResponse } = require('../core/success.response');

class AccessController {
    handlerRefreshToken = async (req, res, next) => {
        // new SuccessResponse({
        //     message: 'Get token success!',
        //     metadata: await AccessService.handlerRefreshToken(
        //         req.body.refreshToken
        //     ),
        // }).send(res);

        // No need accessToken
        new SuccessResponse({
            message: 'Get token success!',
            metadata: await AccessService.handlerRefreshTokenV2({
                refreshToken: req.refreshToken,
                user: req.user,
                keyStore: req.keyStore,
            }),
        }).send(res);
    };

    logout = async (req, res, next) => {
        new SuccessResponse({
            message: 'Logout success!',
            metadata: await AccessService.logout(req.keyStore),
        }).send(res);
    };

    login = async (req, res, next) => {
        new SuccessResponse({
            message: 'Login success!',
            metadata: await AccessService.login(req.body),
        }).send(res);
    };

    signUp = async (req, res, next) => {
        // console.log(`[P]:::signUp ${req.body}`);
        // return res.status(201).json(await AccessService.signUp(req.body));

        new CREATED({
            message: 'Registered',
            metadata: await AccessService.signUp(req.body),
            options: {
                limit: 10,
            },
        }).send(res);
    };

    getMe = async (req, res, next) => {
        console.log(req.user);
        new OK({
            message: 'Get my profile success!',
            metadata: await AccessService.getMe(req.user),
        }).send(res);
    };
}

module.exports = new AccessController();
