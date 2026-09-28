const svc = require('../services/habitService');
const storage = require('../services/storageService');
const analytics = require('../services/analyticsService');
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res)).catch(next);
const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });

exports.list = wrap(async (_q, res) => ok(res, await svc.list()));
exports.create = wrap(async (q, res) => ok(res, await svc.create(q.body || {}), 201));
exports.update = wrap(async (q, res) => ok(res, await svc.updateHabit(q.params.id, q.body || {})));
exports.remove = wrap(async (q, res) => ok(res, await svc.remove(q.params.id)));
exports.status = wrap(async (q, res) => ok(res, await svc.setStatus(q.params.id, q.body || {})));
exports.getSettings = wrap(async (_q, res) => ok(res, await svc.getSettings()));
exports.putSettings = wrap(async (q, res) => ok(res, await svc.updateSettings(q.body || {})));
exports.reset = wrap(async (_q, res) => { await svc.reset(); ok(res, { reset: true }); });
exports.exportJson = wrap(async (_q, res) => {
  res.setHeader('Content-Disposition', 'attachment; filename="habitflow.json"');
  res.type('application/json').send(JSON.stringify(await storage.read(), null, 2));
});
const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
exports.exportCsv = wrap(async (_q, res) => {
  const { habits } = await storage.read();
  const rows = ['habit_id,habit,category,archived,date,status'];
  for (const h of habits) for (const [d, s] of Object.entries(h.history).sort())
    rows.push([h.id, esc(h.name), esc(h.category), !h.active, d, s].join(','));
  res.setHeader('Content-Disposition', 'attachment; filename="habitflow.csv"');
  res.type('text/csv').send(rows.join('\n'));
});
exports.analytics = wrap(async (q, res) => {
  const { habits, settings } = await storage.read();
  ok(res, analytics.compute(habits, settings, q.query));
});
