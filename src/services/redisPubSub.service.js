'use strict';

const redis = require('redis');

class RedisPubSubService {
    constructor() {
        this.subscriber = redis.createClient();
        this.publisher = redis.createClient();
    }

    async publish(channel, message) {
        await this.publisher.connect();
        return new Promise((resolve, reject) => {
            this.publisher.publish(channel, message, (err, reply) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(reply);
                }
            });
        });
    }

    async subscribe(channel, callback) {
        await this.subscriber.connect();
        this.subscriber.subscribe(channel, (message) => {
            callback(channel, message);
        });
    }
}

module.exports = new RedisPubSubService();
