const r = require('express').Router();
const c = require('../controllers/habitController');
r.get('/habits', c.list); r.post('/habits', c.create);
r.put('/habits/:id', c.update); r.delete('/habits/:id', c.remove);
r.patch('/habits/:id/status', c.status);
r.get('/export/json', c.exportJson); r.get('/export/csv', c.exportCsv);
module.exports = r;
