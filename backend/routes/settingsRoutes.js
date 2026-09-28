const r = require('express').Router();
const c = require('../controllers/habitController');
r.get('/settings', c.getSettings); r.put('/settings', c.putSettings); r.post('/reset', c.reset);
module.exports = r;
