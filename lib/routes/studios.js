const router = require('express').Router();
const Studio = require('../models/Studio');
const Film = require('../models/Film');
const ensureRole = require('../util/ensure-role');

const check404 = (studio, id) => {
    if(!studio){
        throw {
            status: 404,
            error: `Studio with ${id} does not exist`
        };
    }
};

module.exports = router
    .post('/', (req, res, next) => {
        Studio.create(req.body)
            .then(studio => res.json(studio))
            .catch(next);
    })

    .get('/', (req, res, next) => {
        Studio.find(req.query)
            .lean()
            .select('name')
            .then(studios => res.json(studios))
            .catch(next);
    })

    .get('/:id', (req, res, next) => {
        const { id } = req.params;

        Studio.findById(id)
            .lean()
            .then(studio => {
                check404(studio, id);
                res.json(studio);
            })
            .catch(next);
    })

    .put('/:id', ensureRole('admin'), (req, res, next) => {
        Studio.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidatiors: true
        }).then(studio => res.json(studio))
            .catch(next);
    })

    .delete('/:id', (req, res, next) => {
        const { id } = req.params;
        Film.find({ studio: id })
            .count()
            .then(count => {
                if(count > 0) throw {
                    status: 400,
                    error: 'Cannot delete studio if there are films in the studio'
                };
                return Studio.findByIdAndRemove(id);
            })
            .then(removed => res.json({ removed }))
            .catch(next);
    });