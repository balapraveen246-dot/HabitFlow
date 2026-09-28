const D = require('./dateUtils');

const isScheduled = (h, date) => date >= h.startDate && (h.schedule.type === 'daily' || h.schedule.days.includes(D.weekday(date)));
// Derived status: null = not applicable (before start / unscheduled / future);
// explicit status wins; past uncompleted scheduled days are "missed"; today stays "pending".
function statusOn(h, date, today) {
  if (date > today || !isScheduled(h, date)) return null;
  if (h.history[date]) return h.history[date];
  return date < today ? 'missed' : 'pending';
}
/* Current streak: consecutive scheduled days ending at TODAY if completed; if today is
   still pending it is skipped and the streak ends YESTERDAY. Unscheduled days are skipped. */
function currentStreak(h, today) {
  let n = 0;
  for (let d = today; d >= h.startDate; d = D.addDays(d, -1)) {
    const s = statusOn(h, d, today);
    if (s === null) continue;
    if (s === 'completed') n++;
    else if (s === 'pending' && d === today) continue;
    else break;
  }
  return n;
}
function longestStreak(h, today) {
  let best = 0, run = 0;
  for (const d of D.range(h.startDate, today)) {
    const s = statusOn(h, d, today);
    if (s === null || s === 'pending') continue;
    run = s === 'completed' ? run + 1 : 0;
    best = Math.max(best, run);
  }
  return best;
}
function compute(habits, settings, { from, to, habitId } = {}) {
  const today = D.todayIn(settings.timezone);
  to = to && D.isValidDate(to) ? to : today;
  from = from && D.isValidDate(from) ? from : D.addDays(to, -29);
  const end = to > today ? today : to;
  const pool = habits.filter((h) => (habitId ? h.id === habitId : h.active));
  const byDay = {};
  const perHabit = pool.map((h) => {
    let completed = 0, missed = 0, pending = 0;
    for (const d of from <= end ? D.range(from, end) : []) {
      const s = statusOn(h, d, today);
      if (!s) continue;
      byDay[d] ||= { date: d, completed: 0, missed: 0 };
      if (s === 'completed') { completed++; byDay[d].completed++; }
      else if (s === 'missed') { missed++; byDay[d].missed++; }
      else pending++;
    }
    const elapsed = completed + missed;
    return { id: h.id, name: h.name, completed, missed, pending, elapsed, rate: elapsed ? completed / elapsed : null,
      currentStreak: currentStreak(h, today), longestStreak: longestStreak(h, today) };
  });
  const sum = (k) => perHabit.reduce((a, x) => a + x[k], 0);
  const elapsed = sum('elapsed');
  return {
    today, from, to,
    summary: { completed: sum('completed'), missed: sum('missed'), pending: sum('pending'), elapsed,
      rate: elapsed ? sum('completed') / elapsed : null, // null => empty state
      currentStreak: Math.max(0, ...perHabit.map((x) => x.currentStreak)),
      longestStreak: Math.max(0, ...perHabit.map((x) => x.longestStreak)) },
    byDay: Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date)),
    perHabit,
  };
}
module.exports = { statusOn, isScheduled, currentStreak, longestStreak, compute };
