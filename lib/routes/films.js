const router = require('express').Router();
const Film = require('../models/Film');
const ensureRole = require('../util/ensure-role');

const check404 = (film, id) => {
    if(!film){
        throw {
            status: 404,
            error: `film with ${id} does not exist`
        };
    }
};

module.exports = router
    .post('/', (req, res, next) => {
        Film.create(req.body)
            .then(film => res.json(film))
            .catch(next);
    })
    
    .get('/:id', (req, res, next) => {
        const { id } = req.params;

        Film.findById(id)
            .lean()
            .then(film => {
                check404(film, id);
                res.json(film);
            })
            .catch(next);
    })
    
    .get('/', (req, res, next) => {
        Film.find(req.query)
            .lean()
            .select('title released studio')
            .populate({
                path: 'studio',
                select: 'name'
            })
            .then(films => res.json(films))
            .catch(next);
    })
    
    .delete('/:id', ensureRole('admin'), (req, res, next) => {
        const { id } = req.params;
        Film.findByIdAndRemove(id)
            .then(removed => res.json({ removed }))
            .catch(next);
    });