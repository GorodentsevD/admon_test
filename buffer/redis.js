'use strict';

const redis = require('redis');
const redisClient = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
});

/**
 * Buffer implementation with Redis
 */
module.exports = {
    /**
     * Store message in redis
     * @param {string} message
     * @return {Promise<>}
     */
    async storeMessage(message) {
        return new Promise((resolve, reject) => {
            redisClient.zadd('buffer', Date.now() + process.env.MSG_TTL_MS, message, e => e ? reject(e) : resolve());
        });
    },

    /**
     * Get list of messages from Redis
     * @param {number} count
     * @return {Promise<string[]>}
     */
    async getMessages(count = null) {
        // Delete expired messages
        await new Promise((resolve, reject) => {
            redisClient.zremrangebyscore('buffer', '-inf', Date.now(), (e, list) => e ? reject(e) : resolve(list));
        });

        // Get list of messages
        let args = ['buffer', Date.now(), '+inf'];
        if (count) args = args.concat(['LIMIT', 0, count]);
        const messages = await new Promise((resolve, reject) => {
            redisClient.zrangebyscore(...args, (e, list) => e ? reject(e) : resolve(list));
        });

        if (messages && messages.length) {
            // Remove getting messages from buffer
            await new Promise((resolve, reject) => {
                redisClient.zrem('buffer', messages, e => e ? reject(e) : resolve());
            })
        }

        return messages;
    },
}