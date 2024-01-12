'use strict';

const keytokenModel = require('../models/keytoken.model');

class KeyTokenService {
    static createKeyToken = async ({
        userId,
        publicKey,
        privateKey,
        refreshToken,
    }) => {
        try {
            // level 0
            // const tokens = await keytokenModel.create({
            //     user: userId,
            //     publicKey,
            //     privateKey,
            // });

            // level xxx
            const filter = { user: userId };
            const update = {
                publicKey,
                privateKey,
                refreshTokenUsed: [],
                refreshToken,
            };
            const option = { upsert: true, new: true };
            const tokens = await keytokenModel.findOneAndUpdate(
                filter,
                update,
                option
            );
            return tokens ? tokens.publicKey : null;
        } catch (error) {
            return error;
        }
    };
}

module.exports = KeyTokenService;
