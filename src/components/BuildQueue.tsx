import { Loader2, CheckCircle, XCircle, Clock, ExternalLink, RotateCcw } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { BuildStatus } from '@/types/business';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const statusConfig: Record<
  BuildStatus,
  { icon: typeof Loader2; label: string; color: string }
> = {
  queued: { icon: Clock, label: 'Queued', color: 'text-muted-foreground' },
  building: { icon: Loader2, label: 'Building', color: 'text-warning' },
  live: { icon: CheckCircle, label: 'Live', color: 'text-success' },
  error: { icon: XCircle, label: 'Error', color: 'text-destructive' },
};

export function BuildQueue() {
  const { buildJobs, updateBuildJob } = useAppStore();

  const handleRetry = (id: string) => {
    updateBuildJob(id, { status: 'building', errorMessage: undefined });
    // Simulate build completion after delay
    setTimeout(() => {
      updateBuildJob(id, { status: 'live' });
    }, 3000);
  };

  if (buildJobs.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <Clock className="h-12 w-12 text-muted-foreground/20 mb-3" />
        <p className="text-muted-foreground text-sm text-center">
          No builds yet. Select a business and hit BUILD SITE.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {buildJobs.map((job) => {
            const config = statusConfig[job.status];
            const StatusIcon = config.icon;

            return (
              <div
                key={job.id}
                className="border border-primary/20 bg-secondary/30 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusIcon
                        className={cn(
                          'h-4 w-4 flex-shrink-0',
                          config.color,
                          job.status === 'building' && 'animate-spin'
                        )}
                      />
                      <span className="font-bold text-sm truncate">
                        {job.businessName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className={cn('uppercase tracking-wider', config.color)}>
                        {config.label}
                      </span>
                      <span>•</span>
                      <span>{format(new Date(job.triggeredAt), 'HH:mm:ss')}</span>
                    </div>

                    {job.status === 'error' && job.errorMessage && (
                      <p className="text-xs text-destructive mt-1">
                        {job.errorMessage}
                      </p>
                    )}

                    {job.status === 'live' && job.previewUrl && (
                      <a
                        href={`https://${job.previewUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline mt-1 flex items-center gap-1"
                      >
                        {job.previewUrl}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>

                  <div className="flex gap-1">
                    {job.status === 'live' && job.previewUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-7 text-xs"
                      >
                        <a
                          href={`https://${job.previewUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View
                        </a>
                      </Button>
                    )}
                    {job.status === 'error' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRetry(job.id)}
                        className="h-7 text-xs"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Retry
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
