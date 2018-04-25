const express = require('express');
const app = express();
require('./models/register-plugins');
const studios = require('./routes/studios');
const actors = require('./routes/actor');
const films = require('./routes/films');
const reviewers = require('./routes/reviewers');
const reviews = require('./routes/reviews');
const auth = require('./routes/auth');

app.use(express.json());

app.use('/studios', studios);
app.use('/actors', actors);
app.use('/films', films);
app.use('/reviewers', reviewers);
app.use('/reviews', reviews);
app.use('/api/auth', auth);

module.exports = app;