export default function ProgressCard({ label, value, icon: Icon, hint, tone = 'text-brand' }) {
  return (
    <div className="card flex items-start gap-3">
      {Icon && <Icon className={`mt-1 h-5 w-5 ${tone}`} aria-hidden />}
      <div><p className="text-sm text-slate-500 dark:text-slate-400">{label}</p><p className="text-2xl font-semibold">{value}</p>{hint && <p className="text-xs text-slate-500">{hint}</p>}</div>
    </div>
  );
}
