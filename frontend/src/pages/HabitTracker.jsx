import { useState } from 'react';
import { Plus, Pencil, Archive, ArchiveRestore, Trash2 } from 'lucide-react';
import HabitGrid from '../components/HabitGrid';
import HabitForm from '../components/HabitForm';
import ConfirmDialog from '../components/ConfirmDialog';
import { STARTERS } from '../utils/habitUtils';

export default function HabitTracker({ store, ym }) {
  const { habits, today, setStatus, createHabit, updateHabit, deleteHabit } = store;
  const [form, setForm] = useState(null); // {} = new, habit = edit
  const [del, setDel] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const active = habits.filter((h) => h.active);
  const archived = habits.filter((h) => !h.active);
  const save = async (b) => { const ok = form.id ? await updateHabit(form.id, b) : await createHabit(b); if (ok) setForm(null); };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-500">Click a day to cycle pending → completed → missed. Past days you skip count as missed.</p>
        <button className="btn-primary" onClick={() => setForm({})}><Plus className="h-4 w-4" />Add habit</button>
      </div>
      {form && <HabitForm initial={form.id ? form : undefined} today={today} onSubmit={save} onCancel={() => setForm(null)} />}
      {active.length ? <HabitGrid habits={active} year={ym.year} month={ym.month} today={today} onSetStatus={setStatus} /> : (
        <div className="card"><p className="font-medium">No active habits</p><p className="text-sm text-slate-500">Start with a suggestion (nothing is marked as done):</p>
          <div className="mt-3 flex flex-wrap gap-2">{STARTERS.map((n) => <button key={n} className="btn-ghost" onClick={() => createHabit({ name: n })}>{n}</button>)}</div></div>)}
      {!!active.length && <section className="card"><h3 className="mb-2 font-semibold">Manage habits</h3><ul className="divide-y divide-slate-100 dark:divide-slate-800">
        {active.map((h) => <Row key={h.id} h={h} onEdit={() => setForm(h)} onArchive={() => updateHabit(h.id, { active: false }, 'Habit archived')} onDelete={() => setDel(h)} />)}</ul></section>}
      {!!archived.length && <section className="card"><button className="font-semibold" onClick={() => setShowArchived(!showArchived)} aria-expanded={showArchived}>Archived ({archived.length})</button>
        {showArchived && <ul className="mt-2 divide-y divide-slate-100 dark:divide-slate-800">{archived.map((h) => <Row key={h.id} h={h} archived onArchive={() => updateHabit(h.id, { active: true }, 'Habit restored')} onDelete={() => setDel(h)} />)}</ul>}</section>}
      {del && <ConfirmDialog title={`Delete "${del.name}"?`} message="This permanently removes the habit and all of its history. Archive it instead to keep your history." confirmLabel="Delete"
        onCancel={() => setDel(null)} onConfirm={async () => { await deleteHabit(del.id); setDel(null); }} />}
    </div>
  );
}
function Row({ h, archived, onEdit, onArchive, onDelete }) {
  return (
    <li className="flex items-center justify-between gap-2 py-2"><span className="min-w-0 truncate">{h.name} <span className="text-xs text-slate-500">{h.category}</span></span>
      <span className="flex gap-1">
        {!archived && <button className="btn-ghost px-2" aria-label={`Edit ${h.name}`} onClick={onEdit}><Pencil className="h-4 w-4" /></button>}
        <button className="btn-ghost px-2" aria-label={`${archived ? 'Restore' : 'Archive'} ${h.name}`} onClick={onArchive}>{archived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}</button>
        <button className="btn-ghost px-2 text-red-600" aria-label={`Delete ${h.name}`} onClick={onDelete}><Trash2 className="h-4 w-4" /></button></span></li>
  );
}
