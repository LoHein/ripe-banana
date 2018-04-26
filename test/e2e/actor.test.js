const { assert } = require('chai');
const request = require('./request');
const { Types } = require('mongoose');
const { dropCollection } = require('./db');
const Actor = require('../../lib/models/Actor');
const Film = require('../../lib/models/Film');

describe('actor api', () => {

    before(() => dropCollection('actors'));
    before(() => dropCollection('films'));
    before(() => dropCollection('reviewers'));



    let data = {
        name: 'Bob',
        dob: '7/18/90',
        pob: 'Portland'
    };

    let actor = {
        name: 'Bill',
        dob: '5/5/50',
        pob: 'Salem'
    };

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
            });
    });
 
    it('saves and gets actor', () => {
        return request.post('/actors')
            .send(data)
            .then(({ body }) => {
                const { _id, __v, dob } = body;
                assert.ok(_id);
                assert.deepEqual(body, {
                    ...data,
                    _id, __v, dob
                });
                data = body;
            });
    });

    const roundTrip = doc => JSON.parse(JSON.stringify(doc.toJSON()));

    it('gets actor by id', () => {
        const filmD = {
            title: 'movieD',
            studio: Types.ObjectId(),
            released: 1990,
            cast: [{ part: 'lead1', actor: null }]
        };
        return Actor.create(actor).then(roundTrip)
            .then(saved => {
                actor = saved;
                filmD.cast[0].actor = saved._id;
                return request.post('/films')
                    .send(filmD);
            })
            .then(() => {
                return request.get(`/actors/${actor._id}`);
            }
            )
            .then(({ body }) => {
                assert.deepEqual(body.films[0].title, filmD.title);
            });
    });

    it('gets all actors', () => {
        return request.get('/actors')
            .then(({ body }) => {
                assert.deepEqual(body[0].name, data.name);
                assert.deepEqual(body[1].name, actor.name);
            });
    });

    it('deletes actor by id', () => {
        return request.delete(`/actors/${data._id}`)
            .set('Authorization', reviewer.roles)
            .then(() => {
                return Actor.findById(data._id);
            })
            .then(found => {
                assert.isNull(found);
            });
    });

    it('updates actor', () => {
        actor.name = 'William';

        return request.put(`/actors/${actor._id}`)
            .set('Authorization', reviewer.roles)
            .send(actor)
            .then(({ body }) => {
                assert.deepEqual(body, actor);
            });
    });

    let film = {
        title: 'Big Lebowski',
        studio: Types.ObjectId(),
        released: 1998,
        cast: [{ part: 'The Dude', actor: actor._id }]
    };

    it('returns error trying to delete actor in film in DB', () => {
        return Film.create(film).then(roundTrip)
            .then(saved => {
                film = saved;
            })
            .then(() => {
                return request.delete(`/actors/${actor._id}`)
                    .set('Authorization', reviewer.roles);
            })
            .then(result => {
                assert.equal(result.status, 400);
            });
    });

});