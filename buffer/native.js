'use strict';

const list = {};

/**
 * Native implementation of buffer
*/
module.exports = {
    /**
     * Store message in list object
     * Key - Date in ms
     * Value - message
     * @param {string} message
     */
    async storeMessage(message) {
        list[Date.now() + process.env.MSG_TTL_MS] = message;
    },

    /**
     * Get list of messages from buffer
     * Delete expired messages from list (if TTL of message > process.env.MSG_TTL_MS)
     * Delete returned messages from list
     * @param {number|null} [count]
     * @return {Promise<string[]>}
     */
    async getMessages(count= null) {
        // Delete expired keys
        const expiredKeys = Object.keys(list).filter(i => i < Date.now());
        expiredKeys.forEach(i => delete list[i]);

        let keys = Object.keys(list).sort((a, b) => {
            if (a < b) return -1;
            if (a > b) return 1;
            return 0;
        });

        if (count !== null) keys = keys.slice(0, count);

        const result = [];

        keys.forEach(i => {
            result.push(list[i]);
            delete list[i]; // Delete returned message from list
        });

        return result;
    }
}