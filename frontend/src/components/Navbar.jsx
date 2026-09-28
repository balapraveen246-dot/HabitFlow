import { Menu, Moon, Sun, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { longDate, monthLabel } from '../utils/dateUtils';
export default function Navbar({ title, today, settings, saving, onMenu, onToggleTheme, month }) {
  const initial = (settings?.displayName || 'H')[0].toUpperCase();
  return (
    <header className="flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900">
      <button className="lg:hidden" aria-label="Open menu" onClick={onMenu}><Menu /></button>
      <div className="min-w-0"><h1 className="truncate text-lg font-semibold">{title}</h1>{today && <p className="hidden text-xs text-slate-500 sm:block">{longDate(today)}</p>}</div>
      {month && (
        <div className="ml-auto flex items-center gap-1 sm:ml-6">
          <button className="btn-ghost px-2" aria-label="Previous month" onClick={() => month.go(-1)}><ChevronLeft className="h-4 w-4" /></button>
          <input type="month" aria-label="Select month" className="input w-40" value={`${month.year}-${String(month.month).padStart(2, '0')}`}
            onChange={(e) => { const [y, m] = e.target.value.split('-').map(Number); if (y && m) month.set(y, m); }} />
          <button className="btn-ghost px-2" aria-label="Next month" onClick={() => month.go(1)}><ChevronRight className="h-4 w-4" /></button>
          <span className="sr-only" aria-live="polite">{monthLabel(month.year, month.month)}</span>
        </div>
      )}
      <div className={`${month ? '' : 'ml-auto'} flex items-center gap-3`}>
        {saving && <span className="flex items-center gap-1 text-xs text-slate-500" role="status"><Loader2 className="h-4 w-4 animate-spin" />Saving</span>}
        <button className="btn-ghost px-2" aria-label="Toggle dark mode" onClick={onToggleTheme}>{settings?.theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>
        <div className="grid h-9 w-9 place-items-center rounded-full bg-brand text-sm font-semibold text-white" aria-label={`Profile: ${settings?.displayName}`}>{initial}</div>
      </div>
    </header>
  );
}
