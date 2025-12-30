import { cn } from '@/lib/utils';
import { BusinessStatus } from '@/types/business';
import { DollarSign } from 'lucide-react';

interface StatusPillProps {
  status: BusinessStatus;
  paid?: boolean;
}

const statusStyles: Record<BusinessStatus, string> = {
  'New Lead': 'status-new',
  'Called': 'status-called',
  'Invoice Sent': 'bg-purple-500/20 text-purple-400 border border-purple-500/40',
  'Paid': 'bg-success/20 text-success border border-success/40 glow-success',
  'Built': 'bg-foreground/20 text-foreground border border-foreground/40',
};

export function StatusPill({ status, paid }: StatusPillProps) {
  return (
    <span className={cn('status-pill flex items-center gap-1', statusStyles[status])}>
      {paid && <DollarSign className="h-2.5 w-2.5" />}
      {status}
    </span>
  );
}
