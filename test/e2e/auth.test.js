const { assert } = require('chai');
const request = require('./request');
const { dropCollection } = require('./db');

describe('Auth api', () => {
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

    it('signin', () => {
        return request
            .post('/api/auth/signin')
            .send({
                email: 'me@me.com',
                password: 'abc'
            })
            .then(({ body }) => {
                assert.ok(body.token);
            });
    });
});