const { assert } = require('chai');
const request = require('./request');
const { dropCollection } = require('./db');

describe.only('Auth api', () => {
    beforeEach(() => dropCollection('reviewers'));

    let token = null;

    beforeEach(() => {
        return request  
            .post('/api/auth/signup')
            .send({
                email: 'me@me.com',
                password: 'abc',
                name: 'Bob',
                company: 'NY times'
            })
            .then(({ body }) => token = body.token);
    });

    it('signup', () => {
        assert.ok(token);
    });

    it('verifies', () => {
        return request
            .get('/api/auth/verify')
            .set('Authorization', token)
            .then(({ body }) => {
                assert.isOk(body.verified);
            });
    });
});