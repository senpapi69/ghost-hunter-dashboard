import { useState } from 'react';
import { Rocket, Loader2, CheckCircle, XCircle, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Business, BuildStatus } from '@/types/business';
import { triggerWebsiteBuild } from '@/lib/webhook';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/utils';

interface WebsiteBuilderProps {
  business: Business | null;
}

export function WebsiteBuilder({ business }: WebsiteBuilderProps) {
  const [status, setStatus] = useState<BuildStatus | 'ready'>('ready');
  const [demoUrl, setDemoUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const { addBuildJob, updateBuildJob, incrementStat } = useAppStore();

  const handleBuild = async () => {
    if (!business) return;

    setStatus('building');
    setDemoUrl(null);

    const jobId = `build-${Date.now()}`;
    addBuildJob({
      id: jobId,
      businessId: business.id,
      businessName: business.name,
      status: 'building',
      triggeredAt: new Date(),
    });

    const result = await triggerWebsiteBuild(business);

    if (result.success) {
      setStatus('live');
      setDemoUrl(result.demoUrl || null);
      updateBuildJob(jobId, {
        status: 'live',
        previewUrl: result.demoUrl,
      });
      incrementStat('sitesBuilt');
      toast({
        title: 'Build Complete',
        description: `Website deployed for ${business.name}`,
      });
    } else {
      setStatus('error');
      updateBuildJob(jobId, {
        status: 'error',
        errorMessage: 'Build failed - check webhook configuration',
      });
      toast({
        title: 'Build Failed',
        description: 'Check webhook configuration',
        variant: 'destructive',
      });
    }
  };

  const statusConfig = {
    ready: { icon: Globe, label: 'Ready to Build', color: 'text-muted-foreground' },
    queued: { icon: Globe, label: 'Queued', color: 'text-muted-foreground' },
    building: { icon: Loader2, label: 'Building...', color: 'text-warning' },
    live: { icon: CheckCircle, label: 'Site Live!', color: 'text-success' },
    error: { icon: XCircle, label: 'Build Failed', color: 'text-destructive' },
  };

  const currentStatus = statusConfig[status];
  const StatusIcon = currentStatus.icon;

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center gap-2 border-b border-primary/20 pb-2">
        <Rocket className="h-4 w-4 text-primary" />
        <h3 className="font-display text-xs font-bold tracking-wider text-primary uppercase">
          Deploy Website
        </h3>
      </div>

      {business ? (
        <>
          <div className="text-sm">
            <p className="font-bold text-foreground">{business.name}</p>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              {business.placeId || 'No Place ID'}
            </p>
          </div>

          <Button
            onClick={handleBuild}
            disabled={status === 'building'}
            className="cyber-button w-full pulse-glow"
          >
            {status === 'building' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                BUILDING...
              </>
            ) : (
              <>
                <Rocket className="mr-2 h-4 w-4" />
                BUILD SITE
              </>
            )}
          </Button>

          <div className="flex items-center gap-2 text-xs">
            <StatusIcon
              className={cn(
                'h-4 w-4',
                currentStatus.color,
                status === 'building' && 'animate-spin'
              )}
            />
            <span className={currentStatus.color}>{currentStatus.label}</span>
          </div>

          {status === 'live' && demoUrl && (
            <a
              href={`https://${demoUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline block"
            >
              {demoUrl}
            </a>
          )}
        </>
      ) : (
        <div className="text-center py-4">
          <Globe className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">
            Select a target first
          </p>
        </div>
      )}
    </div>
  );
}
