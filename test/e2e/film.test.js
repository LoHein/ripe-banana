const { assert } = require('chai');
const request = require('./request');
const { Types } = require('mongoose');
const { dropCollection } = require('./db');
const Film = require('../../lib/models/Film');
const Studio = require('../../lib/models/Studio');


describe.only('film api', () => {

    before(() => dropCollection('films'));
    before(() => dropCollection('studios'));
    before(() => dropCollection('reviewers'));

    let studio = {
        name: 'MGM',
        address: {
            city: 'Seattle',
            state: 'WA',
            country: 'USA'
        }
    };

    let film = {
        title: 'The Shining',
        studio: studio._id,
        released: 1970,
        cast: [{ part: 'lead', actor: Types.ObjectId() }]
    };

    let filmB = {
        title: 'Another one',
        studio: studio._id,
        released: 2000,
        cast: [{ part: 'vilian', actor: Types.ObjectId() }]
    };
    
    let token = null;
    const reviewer = {
        name: 'Joe',
        company: 'joereviews.com',
        email: 'me@me.com',
        password: 'abc123',
        roles: ['admin']
    };

    before(() => {
        return request.post('/api/auth/signup')
            .send(reviewer)
            .then(({ body }) => {
                reviewer._id = body._id;
                token = body.token;
            });
    });

    before(() => {
        return Studio.create(studio).then(roundTrip)
            .then(saved => {
                studio = saved;
                film.studio = saved._id;
                filmB.studio = saved._id;
            });
    });

   
    it('saves and gets film', () => {
        film.studio = studio._id;
        return request.post('/films')
            .send(film)
            .then(({ body }) => {
                const { _id } = body;
                assert.ok(_id);
                assert.ok(body.cast[0].actor);
                film = body;
            });
    });

    const roundTrip = doc => JSON.parse(JSON.stringify(doc.toJSON()));

    it('gets film by id', () => {
        filmB.studio = studio._id;
        return Film.create(filmB).then(roundTrip)
            .then(saved => {
                filmB = saved;
                return request.get(`/films/${filmB._id}`);
            })
            .then(({ body }) => {
                assert.deepEqual(body, filmB);
            });
    });

    it('gets all films', () => {
        return request.get('/films')
            .then(({ body }) => {
                assert.equal(body[0].studio.name, 'MGM');
                assert.equal(body[1].studio.name, 'MGM');
            });
    });

    it('deletes film by id', () => {
        // filmB.cast = [];
        return request.delete(`/films/${filmB._id}`)
            // .set('Authorization', reviewer.roles)
            .then(() => {
                return Film.findById(filmB._id);
            })
            .then((result) => {
                assert.isNull(result);
            });

    });
});