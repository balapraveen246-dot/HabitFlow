import { useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';
import { habitApi } from '../services/habitApi';

export default function Settings({ store }) {
  const { settings, saveSettings, resetData, notify } = store;
  const [f, setF] = useState(settings);
  const [confirm, setConfirm] = useState(false);
  const zones = typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : ['UTC'];
  const submit = (e) => { e.preventDefault(); if (!f.displayName.trim()) return notify('Display name cannot be empty', 'error'); saveSettings({ displayName: f.displayName, theme: f.theme, timezone: f.timezone, weekStart: Number(f.weekStart) }); };
  const dl = (k) => habitApi.download(k).catch((e) => notify(e.message, 'error'));
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <form onSubmit={submit} className="card space-y-4">
        <div><label htmlFor="sn" className="text-sm font-medium">Display name</label><input id="sn" className="input mt-1" maxLength={40} value={f.displayName} onChange={(e) => setF({ ...f, displayName: e.target.value })} /></div>
        <div><label htmlFor="st" className="text-sm font-medium">Theme</label><select id="st" className="input mt-1" value={f.theme} onChange={(e) => setF({ ...f, theme: e.target.value })}><option value="light">Light</option><option value="dark">Dark</option></select></div>
        <div><label htmlFor="sz" className="text-sm font-medium">Timezone</label><select id="sz" className="input mt-1" value={f.timezone} onChange={(e) => setF({ ...f, timezone: e.target.value })}>{[...new Set(['UTC', f.timezone, ...zones])].map((z) => <option key={z}>{z}</option>)}</select>
          <p className="mt-1 text-xs text-slate-500">Decides when a day ends and uncompleted habits count as missed.</p></div>
        <div><label htmlFor="sw" className="text-sm font-medium">Week starts on</label><select id="sw" className="input mt-1" value={f.weekStart} onChange={(e) => setF({ ...f, weekStart: Number(e.target.value) })}><option value={1}>Monday</option><option value={0}>Sunday</option></select></div>
        <button className="btn-primary">Save settings</button>
      </form>
      <section className="card"><h2 className="font-semibold">Export</h2><div className="mt-3 flex gap-2"><button className="btn-ghost" onClick={() => dl('json')}>Export JSON</button><button className="btn-ghost" onClick={() => dl('csv')}>Export CSV</button></div></section>
      <section className="card"><h2 className="font-semibold text-red-600">Reset data</h2><p className="mt-1 text-sm text-slate-500">Deletes every habit, its history, and restores default settings.</p><button className="btn-danger mt-3" onClick={() => setConfirm(true)}>Reset all data</button></section>
      {confirm && <ConfirmDialog title="Reset all data?" message="This cannot be undone. Export your data first if you want a copy." confirmLabel="Reset everything" onCancel={() => setConfirm(false)} onConfirm={async () => { await resetData(); setConfirm(false); setF(null); window.location.reload(); }} />}
    </div>
  );
}
