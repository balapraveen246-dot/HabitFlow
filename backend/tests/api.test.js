const test = require('node:test');
const assert = require('node:assert');
const os = require('os'); const path = require('path');
const storage = require('../services/storageService');
const D = require('../services/dateUtils');
const A = require('../services/analyticsService');
const app = require('../app');

let server, base;
test.before(async () => {
  storage.setFile(path.join(os.tmpdir(), `hf-${process.pid}.json`));
  await storage.reset();
  await new Promise((r) => { server = app.listen(0, r); });
  base = `http://localhost:${server.address().port}/api`;
});
test.after(() => server.close());
const api = async (p, method = 'GET', body) => {
  const res = await fetch(base + p, { method, headers: { 'Content-Type': 'application/json' }, body: body && JSON.stringify(body) });
  return { status: res.status, json: await res.json().catch(() => null) };
};

test('date helpers: leap years and month lengths', () => {
  assert.equal(D.daysInMonth(2024, 2), 29); assert.equal(D.daysInMonth(2025, 2), 28);
  assert.ok(D.isLeapYear(2000)); assert.ok(!D.isLeapYear(1900));
  assert.ok(D.isValidDate('2024-02-29')); assert.ok(!D.isValidDate('2025-02-29'));
  assert.equal(D.addDays('2024-02-28', 1), '2024-02-29'); assert.equal(D.addDays('2024-12-31', 1), '2025-01-01');
});
test('CRUD + validation', async () => {
  assert.equal((await api('/habits', 'POST', { name: '' })).status, 400);
  const c = await api('/habits', 'POST', { name: 'Read' });
  assert.equal(c.status, 201);
  const id = c.json.data.id;
  assert.equal((await api(`/habits/${id}`, 'PUT', { name: 'Read more' })).json.data.name, 'Read more');
  assert.equal((await api(`/habits/${id}`, 'PUT', { active: false })).json.data.active, false);
  assert.equal((await api(`/habits/${id}`, 'DELETE')).status, 200);
  assert.equal((await api(`/habits/${id}`, 'DELETE')).status, 404);
});
test('status updates: set, clear, reject future and bad input', async () => {
  const today = (await api('/habits')).json.data.today;
  const { json } = await api('/habits', 'POST', { name: 'Run', startDate: D.addDays(today, -5) });
  const id = json.data.id;
  assert.equal((await api(`/habits/${id}/status`, 'PATCH', { date: today, status: 'completed' })).json.data.history[today], 'completed');
  assert.equal((await api(`/habits/${id}/status`, 'PATCH', { date: today, status: 'pending' })).json.data.history[today], undefined);
  assert.equal((await api(`/habits/${id}/status`, 'PATCH', { date: D.addDays(today, 1), status: 'completed' })).status, 400);
  assert.equal((await api(`/habits/${id}/status`, 'PATCH', { date: '2025-02-30', status: 'completed' })).status, 400);
  assert.equal((await api(`/habits/${id}/status`, 'PATCH', { date: today, status: 'nope' })).status, 400);
});
test('concurrent writes are not lost', async () => {
  const { json } = await api('/habits', 'POST', { name: 'Concurrent', startDate: '2020-01-01' });
  const id = json.data.id;
  const dates = D.range('2024-03-01', '2024-03-20');
  await Promise.all(dates.map((date) => api(`/habits/${id}/status`, 'PATCH', { date, status: 'completed' })));
  const h = (await api('/habits')).json.data.habits.find((x) => x.id === id);
  assert.equal(Object.keys(h.history).length, dates.length);
});
test('analytics: derived missed, future excluded, streaks, empty denominator', () => {
  const h = { id: 'a', active: true, startDate: '2024-02-26', schedule: { type: 'daily' }, history: { '2024-02-26': 'completed', '2024-02-27': 'completed', '2024-02-29': 'completed' } };
  const today = '2024-03-02';
  assert.equal(A.statusOn(h, '2024-02-28', today), 'missed');
  assert.equal(A.statusOn(h, '2024-03-02', today), 'pending');
  assert.equal(A.statusOn(h, '2024-03-03', today), null);
  assert.equal(A.statusOn(h, '2024-02-25', today), null);
  assert.equal(A.longestStreak(h, today), 2);
  assert.equal(A.currentStreak(h, today), 0);
  const done = { ...h, history: { ...h.history, '2024-03-01': 'completed' } };
  assert.equal(A.currentStreak(done, today), 2); // today pending is skipped
  const future = { ...h, startDate: '2999-01-01' };
  assert.equal(A.compute([future], { timezone: 'UTC' }).summary.rate, null);
});
test('weekday schedules skip unscheduled days', () => {
  const mon = { startDate: '2024-01-01', schedule: { type: 'weekdays', days: [1] }, history: { '2024-01-01': 'completed', '2024-01-08': 'completed' } };
  assert.equal(A.currentStreak(mon, '2024-01-10'), 2);
  assert.equal(A.statusOn(mon, '2024-01-02', '2024-01-10'), null);
});
test('settings validation, CSV export', async () => {
  assert.equal((await api('/settings', 'PUT', { timezone: 'Mars/Base' })).status, 400);
  assert.equal((await api('/settings', 'PUT', { timezone: 'Asia/Kolkata' })).status, 200);
  const res = await fetch(base + '/export/csv');
  assert.ok((await res.text()).startsWith('habit_id,habit'));
});
