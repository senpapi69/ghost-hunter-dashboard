import { useState } from 'react';
import { Rocket, Loader2, CheckCircle, XCircle, Globe, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Business, BuildStatus } from '@/types/business';
import { triggerWebsiteBuild } from '@/lib/webhook';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface WebsiteBuilderProps {
  business: Business | null;
}

export function WebsiteBuilder({ business }: WebsiteBuilderProps) {
  const [status, setStatus] = useState<BuildStatus>('ready');
  const [demoUrl, setDemoUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleBuild = async () => {
    if (!business) return;

    setStatus('building');
    setDemoUrl(null);

    const result = await triggerWebsiteBuild(business);

    if (result.success) {
      setStatus('complete');
      setDemoUrl(result.demoUrl || null);
      toast({
        title: 'Build Complete',
        description: `Website deployed for ${business.name}`,
      });
    } else {
      setStatus('error');
      toast({
        title: 'Build Failed',
        description: 'Failed to trigger website build. Check webhook configuration.',
        variant: 'destructive',
      });
    }
  };

  const statusConfig = {
    ready: {
      icon: Rocket,
      label: 'READY',
      color: 'text-muted-foreground',
    },
    building: {
      icon: Loader2,
      label: 'BUILDING...',
      color: 'text-warning',
    },
    complete: {
      icon: CheckCircle,
      label: 'COMPLETE',
      color: 'text-success',
    },
    error: {
      icon: XCircle,
      label: 'ERROR',
      color: 'text-destructive',
    },
  };

  const currentStatus = statusConfig[status];
  const StatusIcon = currentStatus.icon;

  return (
    <div className="cyber-card h-full flex flex-col">
      <div className="p-4 border-b border-primary/30">
        <h2 className="font-display text-sm font-bold tracking-wider text-primary flex items-center gap-2">
          <Rocket className="h-4 w-4" />
          DEPLOY WEBSITE
        </h2>
      </div>

      <div className="flex-1 p-6 flex flex-col">
        {/* Status indicator */}
        <div className="flex items-center gap-3 mb-6">
          <StatusIcon
            className={cn(
              'h-5 w-5',
              currentStatus.color,
              status === 'building' && 'animate-spin'
            )}
          />
          <span className={cn('font-mono text-sm uppercase tracking-wider', currentStatus.color)}>
            {currentStatus.label}
          </span>
        </div>

        {/* Build button */}
        <Button
          onClick={handleBuild}
          disabled={!business || status === 'building'}
          className={cn(
            'cyber-button h-14 text-lg mb-6',
            !business && 'opacity-50 cursor-not-allowed'
          )}
        >
          {status === 'building' ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              BUILDING...
            </>
          ) : (
            <>
              <Rocket className="mr-2 h-5 w-5" />
              BUILD SITE
            </>
          )}
        </Button>

        {/* Demo preview */}
        <div className="flex-1 border border-primary/30 bg-secondary/30 flex flex-col">
          {/* Browser chrome */}
          <div className="h-8 border-b border-primary/30 flex items-center px-3 gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-destructive/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-warning/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-success/50" />
            </div>
            {demoUrl && (
              <div className="flex-1 flex items-center justify-center">
                <div className="bg-muted/50 px-3 py-1 text-xs text-muted-foreground font-mono flex items-center gap-2">
                  <Globe className="h-3 w-3" />
                  {demoUrl}
                </div>
              </div>
            )}
          </div>

          {/* Preview content */}
          <div className="flex-1 flex items-center justify-center p-4">
            {status === 'complete' && demoUrl ? (
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-success mx-auto mb-3 animate-pulse-glow" />
                <p className="text-success font-display font-bold mb-2">DEMO READY</p>
                <a
                  href={`https://${demoUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary text-sm hover:underline flex items-center justify-center gap-1"
                >
                  View Demo <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            ) : status === 'building' ? (
              <div className="text-center">
                <Loader2 className="h-12 w-12 text-primary mx-auto mb-3 animate-spin" />
                <p className="text-muted-foreground text-sm">Deploying website...</p>
              </div>
            ) : status === 'error' ? (
              <div className="text-center">
                <XCircle className="h-12 w-12 text-destructive mx-auto mb-3" />
                <p className="text-destructive text-sm">Build failed</p>
              </div>
            ) : (
              <div className="text-center">
                <Globe className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">
                  {business ? 'Ready to deploy' : 'Select a target first'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
