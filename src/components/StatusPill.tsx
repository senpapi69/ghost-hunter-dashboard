import { cn } from '@/lib/utils';
import { BusinessStatus } from '@/types/business';
import { DollarSign } from 'lucide-react';

interface StatusPillProps {
  status: BusinessStatus;
  paid?: boolean;
}

const statusStyles: Record<BusinessStatus, string> = {
  'New Lead': 'bg-blue-500/10 text-blue-400 border-blue-500/20 rounded-md px-2 py-0.5 text-xs font-medium border',
  'Called': 'bg-amber-500/10 text-amber-400 border-amber-500/20 rounded-md px-2 py-0.5 text-xs font-medium border',
  'Invoice Sent': 'bg-violet-500/10 text-violet-400 border-violet-500/20 rounded-md px-2 py-0.5 text-xs font-medium border',
  'Paid': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 rounded-md px-2 py-0.5 text-xs font-medium border',
  'Built': 'bg-slate-500/10 text-slate-400 border-slate-500/20 rounded-md px-2 py-0.5 text-xs font-medium border',
};

export function StatusPill({ status, paid }: StatusPillProps) {
  return (
    <span className={cn('flex items-center gap-1', statusStyles[status])}>
      {paid && <DollarSign className="h-3 w-3" />}
      {status}
    </span>
  );
}
