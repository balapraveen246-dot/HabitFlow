const r = require('express').Router();
r.get('/analytics', require('../controllers/habitController').analytics);
module.exports = r;
