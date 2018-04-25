const { assert } = require('chai');
const Reviewer = require('../../lib/models/Reviewer');

describe.only('reviewer model', () => {
    it('reviewer is a valid model', () => {
        const data = {
            name: 'Roger Ebert',
            company: 'roger-ebert.com',
            email: 'me@me.com',
            hash: '12ljsdf',
            roles: ['admin']
        };

        const reviewer = new Reviewer(data);
        data._id = reviewer._id;
        assert.deepEqual(reviewer.toJSON(), data);
    });

    it('name and company are required', () => {
        const reviewer = new Reviewer({});
        const { errors } = reviewer.validateSync();
        assert.equal(errors.name.kind, 'required');
        assert.equal(errors.company.kind, 'required');
    });

    const data = {
        email: 'me@me.com'
    };

    const password = 'abc';

    // let userReviewer = null;
    it('generates hash from password', () => {
        const reviewer = new Reviewer(data);
        reviewer.generateHash(password);
        assert.ok(reviewer.hash);
        assert.notEqual(reviewer.hash, password);
    });

    it('compares password to hash', () => {
        const reviewer = new Reviewer(data);
        reviewer.generateHash(password);
        assert.ok(reviewer.comparePassword(password));
    });

});