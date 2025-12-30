import { useState } from 'react';
import { Rocket, Loader2, CheckCircle, XCircle, Globe, AlertTriangle } from 'lucide-react';
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
  const [isDemo, setIsDemo] = useState(false);
  const { toast } = useToast();
  const { addBuildJob, updateBuildJob, incrementStat } = useAppStore();

  const handleBuild = async () => {
    if (!business) return;

    setStatus('building');
    setDemoUrl(null);
    setIsDemo(false);

    const jobId = `build-${Date.now()}`;
    addBuildJob({
      id: jobId,
      businessId: business.id,
      businessName: business.name,
      package: business.package || 'Business',
      amount: business.amount || 999,
      status: 'building',
      paymentStatus: 'pending',
      triggeredAt: new Date(),
    });

    try {
      const result = await triggerWebsiteBuild(business);

      if (result.success) {
        setStatus('live');
        setDemoUrl(result.demoUrl || null);
        setIsDemo(result.isDemo || false);
        updateBuildJob(jobId, {
          status: 'live',
          previewUrl: result.demoUrl,
        });
        incrementStat('sitesBuilt');
        toast({
          title: result.isDemo ? 'Demo Build Complete' : 'Build Complete',
          description: result.isDemo 
            ? `Simulated deployment for ${business.name}` 
            : `Website deployed for ${business.name}`,
        });
      } else {
        setStatus('error');
        updateBuildJob(jobId, {
          status: 'error',
          errorMessage: 'Webhook unreachable - check CORS/network',
        });
        toast({
          title: 'Build Failed',
          description: 'Webhook unreachable. Check n8n configuration.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Build error:', error);
      setStatus('error');
      updateBuildJob(jobId, {
        status: 'error',
        errorMessage: 'Unexpected error during build',
      });
      toast({
        title: 'Build Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  const statusConfig = {
    ready: { icon: Globe, label: 'Ready to Build', color: 'text-muted-foreground' },
    queued: { icon: Globe, label: 'Queued', color: 'text-muted-foreground' },
    building: { icon: Loader2, label: 'Building...', color: 'text-warning' },
    live: { icon: CheckCircle, label: isDemo ? 'Demo Live!' : 'Site Live!', color: 'text-success' },
    error: { icon: XCircle, label: 'Build Failed', color: 'text-destructive' },
  };

  const currentStatus = statusConfig[status];
  const StatusIcon = currentStatus.icon;

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center gap-2 border-b border-primary/20 pb-2">
        <Rocket className="h-4 w-4 text-primary" />
        <h3 className="font-display text-xs font-bold tracking-wider text-primary uppercase">
          Quick Deploy
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

          {isDemo && status === 'live' && (
            <div className="flex items-center gap-1.5 text-xs text-warning bg-warning/10 px-2 py-1 border border-warning/30">
              <AlertTriangle className="h-3 w-3" />
              <span>Demo mode - webhook bypassed</span>
            </div>
          )}

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

          {status === 'error' && (
            <p className="text-xs text-destructive">
              n8n webhook failed. Ensure CORS is enabled on your n8n server.
            </p>
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
