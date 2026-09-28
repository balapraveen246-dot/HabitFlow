import { weekday } from './dateUtils';
// Mirrors backend statusOn: null = n/a (future, before start, unscheduled).
export function statusOn(h, date, today) {
  const scheduled = date >= h.startDate && (h.schedule.type === 'daily' || h.schedule.days.includes(weekday(date)));
  if (date > today || !scheduled) return date > today ? 'future' : 'off';
  return h.history[date] || (date < today ? 'missed' : 'pending');
}
export const NEXT = { pending: 'completed', completed: 'missed', missed: 'pending' };
export function monthTotals(h, year, month, days, today, ymdFn) {
  let completed = 0, elapsed = 0;
  for (let d = 1; d <= days; d++) {
    const s = statusOn(h, ymdFn(year, month, d), today);
    if (s === 'completed') { completed++; elapsed++; } else if (s === 'missed') elapsed++;
  }
  return { completed, elapsed, pct: elapsed ? Math.round((completed / elapsed) * 100) : null };
}
export const STARTERS = ['Drink water', 'Read 20 minutes', 'Exercise', 'Meditate', 'Sleep by 11 pm', 'Journal'];
export const CATEGORIES = ['General', 'Health', 'Fitness', 'Mind', 'Learning', 'Work', 'Home'];
