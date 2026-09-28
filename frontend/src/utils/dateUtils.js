export const pad = (n) => String(n).padStart(2, '0');
export const daysInMonth = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate(); // m is 1-12
export const ymd = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
export const weekday = (s) => new Date(`${s}T00:00:00Z`).getUTCDay();
export const addDays = (s, n) => { const d = new Date(`${s}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
export const shiftMonth = (y, m, delta) => { const t = y * 12 + (m - 1) + delta; return { year: Math.floor(t / 12), month: (t % 12) + 1 }; };
export const monthLabel = (y, m) => new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString(undefined, { month: 'long', year: 'numeric', timeZone: 'UTC' });
export const longDate = (s) => new Date(`${s}T00:00:00Z`).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
