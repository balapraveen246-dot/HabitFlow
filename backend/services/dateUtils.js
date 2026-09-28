const RE = /^\d{4}-\d{2}-\d{2}$/;
const toUTC = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); };
const fmt = (dt) => dt.toISOString().slice(0, 10);
function isValidDate(s) {
  if (typeof s !== 'string' || !RE.test(s)) return false;
  const dt = toUTC(s);
  return !isNaN(dt) && fmt(dt) === s; // rejects 2023-02-29
}
function isValidTimezone(tz) {
  try { new Intl.DateTimeFormat('en-CA', { timeZone: tz }); return typeof tz === 'string' && tz.length > 0; } catch { return false; }
}
// Today's calendar date in the given IANA timezone (calendar days, not 24h intervals).
function todayIn(tz, now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}
const addDays = (s, n) => { const dt = toUTC(s); dt.setUTCDate(dt.getUTCDate() + n); return fmt(dt); };
const weekday = (s) => toUTC(s).getUTCDay();
const daysInMonth = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();
const isLeapYear = (y) => daysInMonth(y, 2) === 29;
function range(from, to) { const out = []; for (let d = from; d <= to; d = addDays(d, 1)) out.push(d); return out; }
module.exports = { isValidDate, isValidTimezone, todayIn, addDays, weekday, daysInMonth, isLeapYear, range };
