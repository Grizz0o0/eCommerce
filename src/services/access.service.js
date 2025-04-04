'use strict';

const shopModel = require('../models/shop.model');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const KeyTokenService = require('./keyToken.service');
const { createTokenPair, verify } = require('../auth/authUtils');
const { getInfoData } = require('../utils');
const {
    BadRequestError,
    AuthFailureError,
    ForbiddenError,
} = require('../core/error.response');
const { findByEmail } = require('./shop.service');

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN',
};
class AccessService {
    static getMe = async (user) => {
        const foundShop = await shopModel
            .findById(user.userId)
            .select('_id name email rules');
        if (!foundShop)
            throw new ForbiddenError('Something wrong happen !! Pls relogin');
        return foundShop;
    };

    static handlerRefreshTokenV2 = async ({ refreshToken, keyStore, user }) => {
        const { userId, email } = user;
        if (keyStore.refreshTokenUsed.includes(refreshToken)) {
            await KeyTokenService.deleteKeyById(userId);
            throw new ForbiddenError('Something wrong happen !! Pls relogin');
        }

        if (keyStore.refreshToken !== refreshToken)
            throw new AuthFailureError('Shop not registered');

        const foundShop = await findByEmail({ email });
        if (!foundShop) throw new AuthFailureError('Shop not registered');

        // create pairToken
        const tokens = await createTokenPair(
            { userId, email },
            keyStore.publicKey,
            keyStore.privateKey
        );

        //update token
        await keyStore.updateOne({
            $set: {
                refreshToken: tokens.refreshToken,
            },
            $addToSet: {
                refreshTokenUsed: refreshToken,
            },
        });

        return {
            user,
            tokens,
        };
    };

    static handlerRefreshToken = async (refreshToken) => {
        const foundToken = await KeyTokenService.findByRefreshTokenUsed(
            refreshToken
        );

        if (foundToken) {
            // decode xem day la ai?
            const { userId, email } = await verify(
                refreshToken,
                foundToken.privateKey
            );
            console.log({ userId, email });
            if (!userId || !email)
                throw new AuthFailureError('Authentication failed');
            // xoa
            await KeyTokenService.deleteKeyById(userId);
            throw new ForbiddenError('Something wrong happen !! Pls relogin');
        }

        // NO, ngon
        const holderToken = await KeyTokenService.findByRefreshToken(
            refreshToken
        );
        if (!holderToken) throw new AuthFailureError('Shop not registered');

        // verifyToken
        const { userId, email } = await verify(
            refreshToken,
            holderToken.privateKey
        );
        console.log(`[2] === ${email}`);

        // check userId
        const foundShop = await findByEmail({ email });
        if (!foundShop) throw new AuthFailureError('Shop not registered');

        // create pairToken
        const tokens = await createTokenPair(
            { userId, email },
            holderToken.publicKey,
            holderToken.privateKey
        );

        //update token
        await holderToken.updateOne({
            $set: {
                refreshToken: tokens.refreshToken,
            },
            $addToSet: {
                refreshTokenUsed: refreshToken,
            },
        });

        return {
            user: { userId, email },
            tokens,
        };
    };

    static logout = async (keyStore) => {
        const delKey = await KeyTokenService.removeKeyById(keyStore._id);
        console.log(delKey);
        return delKey;
    };

    /*
        1. - check email in dbs
        2. - match password
        3. - create AT vs RT and save
        4. - generate tokens
        5. - get date return login
    */
    static login = async ({ email, password, refreshToken = null }) => {
        // 1
        const foundShop = await findByEmail({ email });
        if (!foundShop) throw new BadRequestError('Shop not registered !');

        // 2
        const match = await bcrypt.compare(password, foundShop.password);
        if (!match) throw new AuthFailureError('Authentication error !');

        // 3
        const publicKey = crypto.randomBytes(64).toString('hex');
        const privateKey = crypto.randomBytes(64).toString('hex');

        //4
        const { _id: userId } = foundShop;
        const tokens = await createTokenPair(
            { userId, email },
            publicKey,
            privateKey
        );

        await KeyTokenService.createKeyToken({
            userId,
            refreshToken: tokens.refreshToken,
            publicKey,
            privateKey,
        });
        //5
        return {
            shop: getInfoData({
                fields: ['_id', 'name', 'email'],
                object: foundShop,
            }),
            tokens,
        };
    };

    static signUp = async ({ name, email, password }) => {
        // try {
        const holderShop = await shopModel.findOne({ email }).lean();

        if (holderShop) {
            throw new BadRequestError('Error: Shop already registered !');
        }

        const passwordHash = await bcrypt.hash(password, 10);
        console.log(`passwordHash ::: ${passwordHash}`);
        const newShop = await shopModel.create({
            name,
            email,
            password: passwordHash,
            rules: [RoleShop.SHOP],
        });

        if (newShop) {
            //create privateKey and publicKey
            // level xxx
            // const { privateKey, publicKey } = crypto.generateKeyPairSync(
            //     'rsa',
            //     {
            //         modulusLength: 4096,
            //         publicKeyEncoding: {
            //             type: 'pkcs1', //pkcs8
            //             format: 'pem',
            //         },
            //         privateKeyEncoding: {
            //             type: 'pkcs1',
            //             format: 'pem',
            //         },
            //     }
            // );

            // level 1
            const publicKey = crypto.randomBytes(64).toString('hex');
            const privateKey = crypto.randomBytes(64).toString('hex');

            console.log({ privateKey, publicKey }); // save collection KeyStore

            const KeyStore = await KeyTokenService.createKeyToken({
                userId: newShop._id,
                publicKey,
                privateKey,
            });

            if (!KeyStore) {
                return {
                    code: 'xxxx',
                    message: 'KeyStore error',
                };
            }

            // created tokens pair
            const tokens = await createTokenPair(
                { userId: newShop._id, email },
                publicKey,
                privateKey
            );
            console.log(`Created Token Success:::`, tokens);

            return {
                shop: getInfoData({
                    fields: ['_id', 'name', 'email'],
                    object: newShop,
                }),
                tokens,
            };
        }
        return {
            code: 200,
            metadata: null,
        };
    };
}

module.exports = AccessService;
