const crypto = require('crypto');
const storage = require('./storageService');
const D = require('./dateUtils');

class HttpError extends Error { constructor(status, message, details) { super(message); this.status = status; this.details = details; } }
const STATUSES = ['completed', 'missed', 'pending'];

function validateHabit(b, partial = false) {
  const errors = [];
  const has = (k) => b[k] !== undefined;
  if (!partial || has('name')) {
    const n = typeof b.name === 'string' ? b.name.trim() : '';
    if (n.length < 1 || n.length > 60) errors.push('name must be 1-60 characters');
  }
  if (has('description') && String(b.description).length > 300) errors.push('description must be at most 300 characters');
  if (has('category') && String(b.category).length > 30) errors.push('category must be at most 30 characters');
  if (has('startDate') && !D.isValidDate(b.startDate)) errors.push('startDate must be a valid YYYY-MM-DD date');
  if (has('schedule')) {
    const s = b.schedule;
    if (!s || !['daily', 'weekdays'].includes(s.type)) errors.push('schedule.type must be daily or weekdays');
    else if (s.type === 'weekdays' && (!Array.isArray(s.days) || !s.days.length || s.days.some((d) => !Number.isInteger(d) || d < 0 || d > 6)))
      errors.push('schedule.days must list weekdays 0-6');
  }
  if (errors.length) throw new HttpError(400, 'Validation failed', errors);
}
const clean = (b) => {
  const o = {};
  if (b.name !== undefined) o.name = b.name.trim();
  for (const k of ['description', 'category', 'icon', 'color', 'startDate']) if (b[k] !== undefined) o[k] = String(b[k]).trim();
  if (b.schedule) o.schedule = b.schedule.type === 'daily' ? { type: 'daily' } : { type: 'weekdays', days: [...new Set(b.schedule.days)].sort() };
  if (b.active !== undefined) o.active = !!b.active;
  return o;
};

async function list() {
  const { habits, settings } = await storage.read();
  return { habits, today: D.todayIn(settings.timezone), settings };
}
async function create(body) {
  validateHabit(body);
  return storage.update((data) => {
    const habit = {
      id: crypto.randomUUID(), description: '', category: 'General', icon: 'star', color: '#16a34a',
      startDate: D.todayIn(data.settings.timezone), schedule: { type: 'daily' }, active: true, history: {},
      createdAt: new Date().toISOString(), ...clean(body),
    };
    data.habits.push(habit);
    return habit;
  });
}
const find = (data, id) => { const h = data.habits.find((x) => x.id === id); if (!h) throw new HttpError(404, 'Habit not found'); return h; };
async function updateHabit(id, body) {
  validateHabit(body, true);
  return storage.update((data) => { const h = find(data, id); Object.assign(h, clean(body)); return h; });
}
async function remove(id) {
  return storage.update((data) => { find(data, id); data.habits = data.habits.filter((h) => h.id !== id); return { id }; });
}
async function setStatus(id, { date, status }) {
  if (!D.isValidDate(date)) throw new HttpError(400, 'date must be a valid YYYY-MM-DD date');
  if (!STATUSES.includes(status)) throw new HttpError(400, 'status must be completed, missed or pending');
  return storage.update((data) => {
    const h = find(data, id);
    const today = D.todayIn(data.settings.timezone);
    if (date > today) throw new HttpError(400, 'Cannot set status for a future date');
    if (date < h.startDate) throw new HttpError(400, 'Date is before the habit start date');
    if (status === 'pending') delete h.history[date]; else h.history[date] = status;
    return h;
  });
}
const getSettings = async () => (await storage.read()).settings;
async function updateSettings(b) {
  const errors = [];
  if (b.displayName !== undefined && (typeof b.displayName !== 'string' || !b.displayName.trim() || b.displayName.length > 40)) errors.push('displayName must be 1-40 characters');
  if (b.theme !== undefined && !['light', 'dark'].includes(b.theme)) errors.push('theme must be light or dark');
  if (b.timezone !== undefined && !D.isValidTimezone(b.timezone)) errors.push('timezone must be a valid IANA timezone');
  if (b.weekStart !== undefined && ![0, 1].includes(b.weekStart)) errors.push('weekStart must be 0 (Sunday) or 1 (Monday)');
  if (errors.length) throw new HttpError(400, 'Validation failed', errors);
  return storage.update((data) => {
    for (const k of ['displayName', 'theme', 'timezone', 'weekStart']) if (b[k] !== undefined) data.settings[k] = k === 'displayName' ? b[k].trim() : b[k];
    return data.settings;
  });
}
module.exports = { list, create, updateHabit, remove, setStatus, getSettings, updateSettings, reset: storage.reset, HttpError };
