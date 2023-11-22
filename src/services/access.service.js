'use strict';

const shopModel = require('../models/shop.model');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const KeyTokenService = require('./keyToken.service');
const { createTokenPair } = require('../auth/authUtils');
const { getInfoData } = require('../untils');

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN',
};
class AccessService {
    static signUp = async ({ name, email, password }) => {
        try {
            const holderShop = await shopModel.findOne({ email }).lean();

            if (holderShop) {
                return {
                    code: 'xxxx',
                    massage: 'Shop already registered',
                };
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
                const { privateKey, publicKey } = crypto.generateKeyPairSync(
                    'rsa',
                    {
                        modulusLength: 4096,
                        publicKeyEncoding: {
                            type: 'pkcs1', //pkcs8
                            format: 'pem',
                        },
                        privateKeyEncoding: {
                            type: 'pkcs1',
                            format: 'pem',
                        },
                    }
                );
                console.log({ privateKey, publicKey }); // save collection KeyStore

                const publicKeyString = await KeyTokenService.createKeyToken({
                    userId: newShop._id,
                    publicKey,
                });

                if (!publicKeyString) {
                    return {
                        code: 'xxxx',
                        massage: 'publicKeyString error',
                    };
                }

                console.log(`publicKeyString::: ${publicKeyString}`);
                const publicKeyObject = crypto.createPublicKey(publicKeyString);

                // created tokens pair
                const tokens = await createTokenPair(
                    { userId: newShop._id, email },
                    publicKeyObject,
                    privateKey
                );
                console.log(`Created Token Success:::`, tokens);

                return {
                    code: 201,
                    metadata: {
                        shop: getInfoData({
                            fields: ['id', 'name', 'email'],
                            object: newShop,
                        }),
                        tokens,
                    },
                };
            }
            return {
                code: 200,
                metadata: null,
            };
        } catch (error) {
            return {
                code: 'xxx',
                massage: error.massage,
            };
        }
    };
}

module.exports = AccessService;
