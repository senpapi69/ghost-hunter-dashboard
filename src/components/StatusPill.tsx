import { cn } from '@/lib/utils';
import { BusinessStatus } from '@/types/business';

interface StatusPillProps {
  status: BusinessStatus;
}

const statusStyles: Record<BusinessStatus, string> = {
  'New Lead': 'status-new',
  'Called': 'status-called',
  'Sold': 'status-sold',
  'Built': 'status-built',
};

export function StatusPill({ status }: StatusPillProps) {
  return (
    <span className={cn('status-pill', statusStyles[status])}>
      {status}
    </span>
  );
}
