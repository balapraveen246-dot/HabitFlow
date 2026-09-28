import { useState } from 'react';
import { CATEGORIES } from '../utils/habitUtils';
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export default function HabitForm({ initial, today, onSubmit, onCancel }) {
  const [f, setF] = useState({ name: '', description: '', category: 'General', color: '#16a34a', startDate: today, schedule: { type: 'daily', days: [1, 2, 3, 4, 5] }, ...initial });
  const [err, setErr] = useState({});
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (!f.name.trim() || f.name.trim().length > 60) er.name = 'Enter a name up to 60 characters.';
    if (f.description.length > 300) er.description = 'Keep the description under 300 characters.';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(f.startDate)) er.startDate = 'Choose a start date.';
    if (f.schedule.type === 'weekdays' && !f.schedule.days.length) er.schedule = 'Pick at least one weekday.';
    setErr(er);
    if (!Object.keys(er).length) onSubmit({ ...f, schedule: f.schedule.type === 'daily' ? { type: 'daily' } : f.schedule });
  };
  const toggleDay = (d) => set('schedule', { ...f.schedule, days: f.schedule.days.includes(d) ? f.schedule.days.filter((x) => x !== d) : [...f.schedule.days, d] });
  const Err = ({ k }) => err[k] ? <p role="alert" className="mt-1 text-xs text-red-600">{err[k]}</p> : null;
  return (
    <form onSubmit={submit} className="card space-y-4" noValidate>
      <div><label className="text-sm font-medium" htmlFor="hn">Name</label><input id="hn" className="input mt-1" value={f.name} onChange={(e) => set('name', e.target.value)} maxLength={60} /><Err k="name" /></div>
      <div><label className="text-sm font-medium" htmlFor="hd">Description (optional)</label><textarea id="hd" className="input mt-1" rows={2} value={f.description} onChange={(e) => set('description', e.target.value)} /><Err k="description" /></div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div><label className="text-sm font-medium" htmlFor="hc">Category</label><select id="hc" className="input mt-1" value={f.category} onChange={(e) => set('category', e.target.value)}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
        <div><label className="text-sm font-medium" htmlFor="hcol">Color</label><input id="hcol" type="color" className="input mt-1 h-10 p-1" value={f.color} onChange={(e) => set('color', e.target.value)} /></div>
        <div><label className="text-sm font-medium" htmlFor="hs">Start date</label><input id="hs" type="date" className="input mt-1" value={f.startDate} onChange={(e) => set('startDate', e.target.value)} /><Err k="startDate" /></div>
      </div>
      <fieldset><legend className="text-sm font-medium">Schedule</legend>
        <div className="mt-1 flex gap-4 text-sm">
          {['daily', 'weekdays'].map((t) => <label key={t} className="flex items-center gap-1"><input type="radio" checked={f.schedule.type === t} onChange={() => set('schedule', { ...f.schedule, type: t })} />{t === 'daily' ? 'Every day' : 'Selected weekdays'}</label>)}
        </div>
        {f.schedule.type === 'weekdays' && <div className="mt-2 flex flex-wrap gap-2">{DAYS.map((d, i) => <label key={d} className="flex items-center gap-1 text-sm"><input type="checkbox" checked={f.schedule.days.includes(i)} onChange={() => toggleDay(i)} />{d}</label>)}</div>}
        <Err k="schedule" />
      </fieldset>
      <div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button><button className="btn-primary">Save habit</button></div>
    </form>
  );
}
