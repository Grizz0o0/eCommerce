'use strict';

const { createClient } = require('redis');
const { promisify } = require('util');
const {
    reservationInventory,
} = require('../models/repositories/inventory.repo');

const redisClient = createClient();

redisClient.on('error', (err) => {
    console.error('Redis Client Error', err);
});

(async () => {
    try {
        // Kết nối tới Redis server
        await redisClient.connect();
        console.log(`Connected to Redis: ${redisClient.isReady}`);
        const result = await redisClient.ping();
        console.log(`PING: ${result}`);
    } catch (err) {
        console.error(`Error: ${err}`);
    } finally {
        await redisClient.disconnect();
    }
})();

const pexpire = promisify(redisClient.pExpire).bind(redisClient);
const setnxAsync = promisify(redisClient.setNX).bind(redisClient);

const acquireLock = async (productId, quantity, cartId) => {
    const key = `lock_v2024_${productId}`;
    const retrtTimes = 10; // cho thu lai 10 lan
    const expireTime = 3000; // tam lock 3 giay

    for (let i = 0; i < retrtTimes; i++) {
        const result = await setnxAsync(key, expireTime);
        console.log(`result::: ${result}`);
        if (result === 1) {
            // thao tac voi inventory
            const isReservation = await reservationInventory({
                productId,
                quantity,
                cartId,
            });
            if (isReservation.modifiedCount) {
                await pexpire(key, expireTime);
                return key;
            }
            return null;
        } else {
            await new Promise((resolve) => setTimeout(resolve, 50));
        }
    }
};

const releaseLock = async (keyLock) => {
    const delAsyncKey = promisify(redisClient.del).bind(redisClient);
    return await delAsyncKey(keyLock);
};

module.exports = {
    acquireLock,
    releaseLock,
};
