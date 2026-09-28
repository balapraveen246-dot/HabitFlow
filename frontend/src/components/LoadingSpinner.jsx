import { Loader2 } from 'lucide-react';
export default function LoadingSpinner({ label = 'Loading' }) {
  return <div role="status" className="flex items-center gap-2 p-6 text-slate-500"><Loader2 className="h-5 w-5 animate-spin" aria-hidden />{label}…</div>;
}
