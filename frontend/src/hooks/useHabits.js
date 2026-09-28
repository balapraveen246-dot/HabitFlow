import { useCallback, useEffect, useState } from 'react';
import { habitApi } from '../services/habitApi';

export function useHabits() {
  const [state, setState] = useState({ habits: [], today: null, settings: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(0);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const notify = useCallback((message, type = 'success') => { setToast({ message, type, id: Date.now() }); }, []);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 4000); return () => clearTimeout(t); } }, [toast]);

  const load = useCallback(async () => {
    try { setState(await habitApi.list()); setError(null); } catch (e) { setError(e.message); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { document.documentElement.classList.toggle('dark', state.settings?.theme === 'dark'); }, [state.settings?.theme]);

  const run = async (fn, okMsg) => {
    try { const r = await fn(); await load(); if (okMsg) notify(okMsg); return r; } catch (e) { notify(e.message, 'error'); return null; }
  };
  const setStatus = async (id, date, status) => {
    const prev = state; // optimistic update, reverted on failure
    setState((s) => ({ ...s, habits: s.habits.map((h) => { if (h.id !== id) return h; const history = { ...h.history }; if (status === 'pending') delete history[date]; else history[date] = status; return { ...h, history }; }) }));
    setSaving((n) => n + 1);
    try { await habitApi.setStatus(id, date, status); } catch (e) { setState(prev); notify(e.message, 'error'); } finally { setSaving((n) => n - 1); }
  };
  return {
    ...state, loading, saving: saving > 0, error, toast, notify, reload: load, setStatus,
    createHabit: (b) => run(() => habitApi.create(b), 'Habit added'),
    updateHabit: (id, b, msg = 'Habit saved') => run(() => habitApi.update(id, b), msg),
    deleteHabit: (id) => run(() => habitApi.remove(id), 'Habit deleted'),
    saveSettings: (b) => run(() => habitApi.saveSettings(b), 'Settings saved'),
    resetData: () => run(() => habitApi.reset(), 'All data reset'),
  };
}
