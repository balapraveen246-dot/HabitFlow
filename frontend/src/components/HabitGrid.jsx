import StatusCell from './StatusCell';
import { daysInMonth, ymd } from '../utils/dateUtils';
import { statusOn, NEXT, monthTotals } from '../utils/habitUtils';
export default function HabitGrid({ habits, year, month, today, onSetStatus }) {
  const days = daysInMonth(year, month);
  return (
    <div className="card overflow-x-auto p-0">
      <table className="w-max min-w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800">
            <th className="sticky left-0 z-10 min-w-[10rem] bg-white p-3 text-left dark:bg-slate-900">Habit</th>
            {Array.from({ length: days }, (_, i) => <th key={i} scope="col" className="px-1 py-3 text-center font-medium text-slate-500">{i + 1}</th>)}
            <th className="p-3 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {habits.map((h) => {
            const t = monthTotals(h, year, month, days, today, ymd);
            return (
              <tr key={h.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                <th scope="row" className="sticky left-0 z-10 bg-white p-3 text-left font-medium dark:bg-slate-900">
                  <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ background: h.color }} aria-hidden />{h.name}
                </th>
                {Array.from({ length: days }, (_, i) => {
                  const date = ymd(year, month, i + 1);
                  const s = statusOn(h, date, today);
                  return <td key={date} className="px-0.5 py-1.5"><StatusCell status={s} date={date} habitName={h.name} onCycle={() => onSetStatus(h.id, date, NEXT[s])} /></td>;
                })}
                <td className="whitespace-nowrap p-3 text-right tabular-nums">{t.completed} / {t.elapsed}{t.pct !== null && <span className="ml-1 text-slate-500">({t.pct}%)</span>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
