import { Check, X, Minus } from 'lucide-react';

const LOOK = {
  completed: {
    cls: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
    icon: Check,
    label: 'Completed',
  },

  missed: {
    cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    icon: X,
    label: 'Missed',
  },

  pending: {
    cls: 'border border-slate-300 text-slate-400 dark:border-slate-600',
    icon: Minus,
    label: 'Pending',
  },
};

export default function StatusCell({
  status,
  date,
  habitName,
  onCycle,
}) {
  // Habit is not scheduled for this day
  if (status === 'off') {
    return (
      <span
        className="block h-8 w-8 text-center text-slate-300"
        title={`${date}: not scheduled`}
        aria-label={`${date}: not scheduled`}
      >
        ·
      </span>
    );
  }

  // Future dates cannot be changed
  const future = status === 'future';

  // If status is missing/undefined, treat it as pending
  const safeStatus =
    status === 'completed' ||
    status === 'missed' ||
    status === 'pending'
      ? status
      : 'pending';

  const look = LOOK[future ? 'pending' : safeStatus];

  const Icon = look.icon;

  const title = future
    ? `${date}: future date`
    : `${date}: ${look.label}`;

  return (
    <button
      type="button"
      disabled={future}
      onClick={onCycle}
      title={title}
      aria-label={`${habitName}, ${title}. Activate to change.`}
      className={`grid h-8 w-8 place-items-center rounded-md transition-colors ${
        look.cls
      } ${
        future
          ? 'cursor-not-allowed opacity-40'
          : 'hover:brightness-95'
      }`}
    >
      <Icon className="h-4 w-4" aria-hidden />
    </button>
  );
}