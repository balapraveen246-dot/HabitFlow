import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Table2, BarChart3, Settings, Leaf, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
const LINKS = [['/', 'Dashboard', LayoutDashboard], ['/tracker', 'Habit Tracker', Table2], ['/analytics', 'Analytics', BarChart3], ['/settings', 'Settings', Settings]];
export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200 bg-white transition-transform dark:border-slate-800 dark:bg-slate-900 lg:static lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} ${collapsed ? 'lg:w-16' : 'w-64'}`}>
        <div className="flex h-16 items-center justify-between px-4">
          <span className="flex items-center gap-2 font-semibold text-brand"><Leaf className="h-6 w-6" aria-hidden />{!collapsed && 'HabitFlow'}</span>
          <button className="lg:hidden" aria-label="Close menu" onClick={() => setMobileOpen(false)}><X /></button>
        </div>
        <nav className="flex-1 space-y-1 px-2" aria-label="Main">
          {LINKS.map(([to, label, Icon]) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={() => setMobileOpen(false)} title={label}
              className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${isActive ? 'bg-brand-soft text-brand-dark dark:bg-green-900/30 dark:text-green-400' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
              <Icon className="h-5 w-5 shrink-0" aria-hidden />{!collapsed && label}
            </NavLink>
          ))}
        </nav>
        <button className="m-2 hidden items-center gap-2 rounded-lg p-2 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:flex" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <><PanelLeftClose className="h-5 w-5" />Collapse</>}
        </button>
      </aside>
    </>
  );
}
