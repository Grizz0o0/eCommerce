'use strict';

const JWT = require('jsonwebtoken');
const asyncHandler = require('../helpers/asyncHandler');
const { AuthFailureError, NotFoundError } = require('../core/error.response');
const { findByUserId } = require('../services/keyToken.service');

const HEADER = {
    API_KEY: 'x-api-key',
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization',
    REFRESHTOKEN: 'x-rtoken-id',
};
const createTokenPair = async (payload, publicKey, privateKey) => {
    try {
        // accessToken
        const accessToken = await JWT.sign(payload, publicKey, {
            expiresIn: '2 days',
        });

        const refreshToken = await JWT.sign(payload, privateKey, {
            expiresIn: '7 days',
        });

        JWT.verify(accessToken, publicKey, (err, decode) => {
            if (err) {
                console.log('error verify:::', err);
            } else {
                console.log(`decode verify:::`, decode);
            }
        });

        return { accessToken, refreshToken };
    } catch (error) {}
};

const handleJwtError = (error) => {
    if (error.name === 'TokenExpiredError') {
        throw new AuthFailureError('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
        throw new AuthFailureError('Invalid token');
    } else {
        throw error; // Các lỗi khác
    }
};

const authentication = asyncHandler(async (req, res, next) => {
    /**
     * 1. Check userId missing ?
     * 2. Get accessToken
     * 3. Verify token
     * 4. Check userId in db ?
     * 5. Check keyStore with this userId?
     * 6. OK all => return next()
     */

    // 1
    const userId = req.headers[HEADER.CLIENT_ID];
    if (!userId) throw new AuthFailureError('Missing or invalid client ID');

    // 2
    const keyStore = await findByUserId(userId);
    if (!keyStore) throw new NotFoundError('KeyStore not found for this user');
    console.log(keyStore);
    // 3
    const accessToken = req.headers[HEADER.AUTHORIZATION];
    if (!accessToken)
        throw new AuthFailureError('Missing or invalid authorization token');

    try {
        // 4
        const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
        if (userId !== decodeUser.userId)
            throw new AuthFailureError('Token user ID mismatch');
        req.keyStore = keyStore;
        req.user = decodeUser;
        return next();
    } catch (error) {
        console.error(`Authentication error: ${error.message}`);
        handleJwtError(error);
    }
});

const authenticationV2 = asyncHandler(async (req, res, next) => {
    /**
     * 1. Check userId missing ?
     * 2. Get accessToken
     * 3. Verify token
     * 4. Check userId in db ?
     * 5. Check keyStore with this userId?
     * 6. OK all => return next()
     */

    // 1
    const userId = req.headers[HEADER.CLIENT_ID];
    if (!userId) throw new AuthFailureError('Missing or invalid client ID');

    // 2
    const keyStore = await findByUserId(userId);
    if (!keyStore) throw new NotFoundError('KeyStore not found for this user');
    // 3
    if (req.headers[HEADER.REFRESHTOKEN]) {
        try {
            const refreshToken = req.headers[HEADER.REFRESHTOKEN];
            const decodeUser = JWT.verify(refreshToken, keyStore.privateKey);
            if (userId !== decodeUser.userId)
                throw new AuthFailureError('Token user ID mismatch');
            req.keyStore = keyStore;
            req.user = decodeUser;
            req.refreshToken = refreshToken;
            return next();
        } catch (error) {
            console.error(`Authentication error: ${error.message}`);
            handleJwtError(error);
        }
    }
});

const verify = async (token, keySecret) => {
    try {
        const decoded = JWT.verify(token, keySecret);
        return decoded;
    } catch (err) {
        console.log(err);
        if (err.name === 'TokenExpiredError') {
            throw new AuthFailureError('Token has expired');
        } else if (err.name === 'JsonWebTokenError') {
            throw new AuthFailureError('Invalid token');
        } else {
            throw new AuthFailureError('Token verification failed');
        }
    }
};

// return await JWT.verify(token, keySecret, (err, decode) => {
//         if (err) {
//             if (err.name === 'TokenExpiredError') {
//                 throw new AuthFailureError('token_expired');
//             } else {
//                 throw new AuthFailureError('invalid_token');
//             }
//         }
//     });

module.exports = {
    createTokenPair,
    authentication,
    verify,
    authenticationV2,
};
