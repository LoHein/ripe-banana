const { assert } = require('chai');
const request = require('./request');
const { dropCollection } = require('./db');
const Reviewer = require('../../lib/models/Reviewer');

describe('reviewer api', () => {
    before(() => dropCollection('reviewers'));

    let reviewerA = {
        name: 'John',
        company: 'johnreveiws.com'
    };

    let reviewerB = {
        name: 'Smith',
        company: 'smithreviews.com'
    };

    it('saves and gets reviewer', () => {
        return request.post('/reviewers')
            .send(reviewerA)
            .then(({ body }) => {
                const { _id, __v, roles } = body;
                assert.ok(_id);
                assert.deepEqual(body, {
                    ...reviewerA,
                    _id, __v, roles 
                });
                reviewerA = body;
            });
    });

    const roundTrip = doc => JSON.parse(JSON.stringify(doc.toJSON()));

    it('gets reviewer by id', () => {
        return Reviewer.create(reviewerB).then(roundTrip)
            .then(saved => {
                reviewerB = saved;
                return request.get(`/reviewers/${reviewerB._id}`);
            })
            .then(({ body }) => {
                assert.equal(body.__v, 0);
                assert.ok(body._id);
                assert.ok(body.reviews);
            });
    });

    it('returns all reviewers', () => {
        return request.get('/reviewers')
            .then(({ body }) => {
                assert.deepEqual(body, [reviewerA, reviewerB]);
            });
    });

    it('update a reviewer', () => {
        reviewerA.name = 'Jon';

        return request.put(`/reviewers/${reviewerA._id}`)
            .send(reviewerA)
            .then(({ body }) => {
                assert.deepEqual(body, reviewerA);
            });
    });

    it('deletes reviewer by id', () => {
        return request.delete(`/reviewers/${reviewerB._id}`)
            .then(() => {
                return Reviewer.findById(reviewerB._id);
            })
            .then(found => {
                assert.isNull(found);
            });
    });

});