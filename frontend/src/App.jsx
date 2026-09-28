import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';
import Dashboard from './pages/Dashboard';
import HabitTracker from './pages/HabitTracker';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import { useHabits } from './hooks/useHabits';
import { shiftMonth } from './utils/dateUtils';

const TITLES = { '/': 'Dashboard', '/tracker': 'Habit Tracker', '/analytics': 'Analytics', '/settings': 'Settings' };
export default function App() {
  const store = useHabits();
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ym, setYm] = useState(null);
  const now = store.today ? store.today.split('-').map(Number) : null;
  const cur = ym || (now && { year: now[0], month: now[1] });
  const month = pathname === '/tracker' && cur ? { ...cur, go: (d) => setYm(shiftMonth(cur.year, cur.month, d)), set: (year, month) => setYm({ year, month }) } : null;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar title={TITLES[pathname] || 'HabitFlow'} today={store.today} settings={store.settings} saving={store.saving} month={month}
          onMenu={() => setMobileOpen(true)} onToggleTheme={() => store.saveSettings({ theme: store.settings?.theme === 'dark' ? 'light' : 'dark' })} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {store.loading ? <LoadingSpinner /> : store.error ? (
            <div role="alert" className="card border-red-300 text-red-700"><p className="font-medium">Couldn't load your habits</p><p className="text-sm">{store.error}</p><button className="btn-primary mt-3" onClick={store.reload}>Try again</button></div>
          ) : (
            <Routes>
              <Route path="/" element={<Dashboard store={store} />} />
              <Route path="/tracker" element={<HabitTracker store={store} ym={cur} />} />
              <Route path="/analytics" element={<Analytics store={store} />} />
              <Route path="/settings" element={<Settings store={store} />} />
            </Routes>
          )}
        </main>
      </div>
      {store.toast && <div role="status" aria-live="polite" className={`fixed bottom-4 right-4 z-50 max-w-sm rounded-lg px-4 py-3 text-sm text-white shadow-lg ${store.toast.type === 'error' ? 'bg-red-600' : 'bg-slate-800'}`}>{store.toast.message}</div>}
    </div>
  );
}
