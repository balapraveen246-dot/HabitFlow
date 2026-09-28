import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ListChecks, CheckCircle2, XCircle, Clock, Flame, Trophy } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import ProgressCard from '../components/ProgressCard';
import HabitGrid from '../components/HabitGrid';
import StatusCell from '../components/StatusCell';
import { habitApi } from '../services/habitApi';
import { statusOn, NEXT } from '../utils/habitUtils';
import { addDays } from '../utils/dateUtils';

export default function Dashboard({ store }) {
  const { habits, today, settings, setStatus } = store;
  const active = habits.filter((h) => h.active);
  const [an, setAn] = useState(null);
  const sig = JSON.stringify(habits.map((h) => [h.id, h.active, h.history]));
  useEffect(() => { habitApi.analytics({ from: addDays(today, -6), to: today }).then(setAn).catch((e) => store.notify(e.message, 'error')); }, [sig, today]); // eslint-disable-line

  if (!active.length) return (
    <div className="card mx-auto max-w-lg text-center"><h2 className="text-xl font-semibold">Welcome, {settings.displayName}</h2>
      <p className="mt-2 text-slate-500">You have no habits yet. Add your first one and start tracking today.</p>
      <Link to="/tracker" className="btn-primary mt-4">Add a habit</Link></div>
  );
  const scheduled = active.map((h) => [h, statusOn(h, today, today)]).filter(([, s]) => ['completed', 'missed', 'pending'].includes(s));
  const count = (k) => scheduled.filter(([, s]) => s === k).length;
  const [y, m] = today.split('-').map(Number);
  const pct = an?.summary.rate == null ? '—' : `${Math.round(an.summary.rate * 100)}%`;
  const chart = an ? an.byDay.map((d) => ({ day: d.date.slice(5), Completed: d.completed, Missed: d.missed })) : [];
  const done = count('completed');
  const msg = !scheduled.length ? 'Nothing is scheduled today. Enjoy the rest.' : done === scheduled.length ? 'Everything done for today. Well played.' : `${scheduled.length - done} left today. One at a time.`;

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-semibold">Welcome back, {settings.displayName}</h2><p className="text-slate-500">{msg}</p></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ProgressCard label="Active habits" value={active.length} icon={ListChecks} />
        <ProgressCard label="Completed today" value={done} icon={CheckCircle2} />
        <ProgressCard label="Missed today" value={count('missed')} icon={XCircle} tone="text-red-600" />
        <ProgressCard label="Pending today" value={count('pending')} icon={Clock} tone="text-slate-500" />
        <ProgressCard label="Completion, last 7 days" value={pct} icon={CheckCircle2} />
        <ProgressCard label="Current streak" value={`${an?.summary.currentStreak ?? 0} days`} icon={Flame} tone="text-orange-500" hint="Best across habits; today counts once completed" />
        <ProgressCard label="Best streak" value={`${an?.summary.longestStreak ?? 0} days`} icon={Trophy} tone="text-amber-500" />
      </div>
      <section className="card"><h3 className="mb-3 font-semibold">Today's habits</h3>
        {!scheduled.length ? <p className="text-sm text-slate-500">No habits are scheduled today.</p> : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">{scheduled.map(([h, s]) => (
            <li key={h.id} className="flex items-center justify-between py-2"><span>{h.name}</span>
              <StatusCell status={s} date={today} habitName={h.name} onCycle={() => setStatus(h.id, today, NEXT[s])} /></li>))}</ul>)}
      </section>
      <section className="card"><h3 className="mb-3 font-semibold">Last 7 days</h3>
        {chart.length ? <div className="h-56"><ResponsiveContainer><BarChart data={chart}><CartesianGrid strokeDasharray="3 3" opacity={0.3} /><XAxis dataKey="day" /><YAxis allowDecimals={false} /><Tooltip />
          <Bar dataKey="Completed" fill="#16a34a" stackId="a" /><Bar dataKey="Missed" fill="#dc2626" stackId="a" /></BarChart></ResponsiveContainer></div> : <p className="text-sm text-slate-500">No elapsed scheduled days yet.</p>}
      </section>
      <section><h3 className="mb-3 font-semibold">This month</h3><HabitGrid habits={active} year={y} month={m} today={today} onSetStatus={setStatus} /></section>
    </div>
  );
}
