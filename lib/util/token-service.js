const jwt = require('jsonwebtoken');
const APP_SECRET = process.env.APP_SECTRET || 'changemenow';

module.exports = {
    sign(reviewer) {
        const payload = {
            id: reviewer._id,
            roles: reviewer.roles 
        };

        return jwt.sign(payload, APP_SECRET);
    },
    verify(token) {
        return jwt.verify(token, APP_SECRET);
    }
};