import { cn } from '@/lib/utils';
import { BusinessStatus } from '@/types/business';
import { DollarSign } from 'lucide-react';

interface StatusPillProps {
  status: BusinessStatus;
  paid?: boolean;
}

const baseClasses = 'rounded-md px-2 py-0.5 text-xs font-medium border flex items-center gap-1';

const statusVariants: Record<BusinessStatus, string> = {
  'New Lead': 'bg-primary/10 text-primary border-primary/20',
  'Called': 'bg-warning/10 text-warning border-warning/20',
  'Invoice Sent': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  'Paid': 'bg-success/10 text-success border-success/20',
  'Built': 'bg-muted text-muted-foreground border-border',
};

export function StatusPill({ status, paid }: StatusPillProps) {
  return (
    <span className={cn(baseClasses, statusVariants[status])}>
      {paid && <DollarSign className="h-3 w-3" />}
      {status}
    </span>
  );
}
