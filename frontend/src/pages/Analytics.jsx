import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import ProgressCard from '../components/ProgressCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { CheckCircle2, XCircle, Flame, Trophy, Percent } from 'lucide-react';
import { habitApi } from '../services/habitApi';
import { addDays } from '../utils/dateUtils';

export default function Analytics({ store }) {
  const { habits, today } = store;
  const [habitId, setHabitId] = useState('');
  const [from, setFrom] = useState(addDays(today, -29));
  const [to, setTo] = useState(today);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const sig = JSON.stringify(habits.map((h) => h.history));
  useEffect(() => { setError(null); habitApi.analytics({ from, to, habitId: habitId || undefined }).then(setData).catch((e) => setError(e.message)); }, [from, to, habitId, sig]);
  if (error) return <div role="alert" className="card text-red-700">{error}</div>;
  if (!data) return <LoadingSpinner />;
  const s = data.summary;
  const max = Math.max(1, ...data.byDay.map((d) => d.completed + d.missed));
  return (
    <div className="space-y-6">
      <div className="card flex flex-wrap items-end gap-4">
        <div><label className="text-sm" htmlFor="ah">Habit</label><select id="ah" className="input mt-1" value={habitId} onChange={(e) => setHabitId(e.target.value)}><option value="">All active habits</option>{habits.map((h) => <option key={h.id} value={h.id}>{h.name}{h.active ? '' : ' (archived)'}</option>)}</select></div>
        <div><label className="text-sm" htmlFor="af">From</label><input id="af" type="date" className="input mt-1" value={from} max={to} onChange={(e) => setFrom(e.target.value)} /></div>
        <div><label className="text-sm" htmlFor="at">To</label><input id="at" type="date" className="input mt-1" value={to} max={today} onChange={(e) => setTo(e.target.value)} /></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <ProgressCard label="Completion rate" value={s.rate == null ? '—' : `${Math.round(s.rate * 100)}%`} icon={Percent} hint={s.rate == null ? 'No elapsed scheduled days in this range' : `${s.completed} of ${s.elapsed} occurrences`} />
        <ProgressCard label="Completed" value={s.completed} icon={CheckCircle2} />
        <ProgressCard label="Missed" value={s.missed} icon={XCircle} tone="text-red-600" />
        <ProgressCard label="Current streak" value={s.currentStreak} icon={Flame} tone="text-orange-500" />
        <ProgressCard label="Longest streak" value={s.longestStreak} icon={Trophy} tone="text-amber-500" />
      </div>
      {!data.byDay.length ? <div className="card text-slate-500">Nothing to chart yet. Complete or miss a scheduled habit in this range and it will show up here.</div> : (<>
        <section className="card"><h3 className="mb-3 font-semibold">Daily completion</h3><div className="h-64"><ResponsiveContainer><BarChart data={data.byDay.map((d) => ({ ...d, day: d.date.slice(5) }))}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} /><XAxis dataKey="day" /><YAxis allowDecimals={false} /><Tooltip /><Legend />
          <Bar dataKey="completed" name="Completed" fill="#16a34a" stackId="a" /><Bar dataKey="missed" name="Missed" fill="#dc2626" stackId="a" /></BarChart></ResponsiveContainer></div></section>
        <section className="card"><h3 className="mb-3 font-semibold">Heatmap</h3>
          <div className="flex flex-wrap gap-1">{data.byDay.map((d) => { const r = d.completed / (d.completed + d.missed || 1); return (
            <span key={d.date} title={`${d.date}: ${d.completed} completed, ${d.missed} missed`} aria-label={`${d.date}: ${d.completed} completed, ${d.missed} missed`}
              className="h-6 w-6 rounded" style={{ background: `rgba(22,163,74,${0.12 + r * 0.88})`, outline: r < 0.5 ? '1px solid #dc2626' : 'none' }} />); })}</div>
          <p className="mt-2 text-xs text-slate-500">Darker green = higher completion. Red outline = fewer than half completed. Future days are not shown.</p></section>
      </>)}
      <section className="card overflow-x-auto"><h3 className="mb-3 font-semibold">By habit</h3><table className="w-full text-sm"><thead><tr className="text-left text-slate-500"><th>Habit</th><th>Rate</th><th>Done</th><th>Missed</th><th>Streak</th><th>Best</th></tr></thead>
        <tbody>{data.perHabit.map((p) => <tr key={p.id}><td className="py-1">{p.name}</td><td>{p.rate == null ? '—' : `${Math.round(p.rate * 100)}%`}</td><td>{p.completed}</td><td>{p.missed}</td><td>{p.currentStreak}</td><td>{p.longestStreak}</td></tr>)}</tbody></table></section>
      <p className="hidden">{max}</p>
    </div>
  );
}
