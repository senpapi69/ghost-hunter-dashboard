import { Sparkles, Brain, Target, AlertCircle, Copy, Check } from 'lucide-react';
import { Business } from '@/types/business';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface IntelligencePanelProps {
  business: Business | null;
}

export function IntelligencePanel({ business }: IntelligencePanelProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async () => {
    if (!business?.notes) return;
    await navigator.clipboard.writeText(business.notes);
    setCopied(true);
    toast({ title: 'Copied to clipboard' });
    setTimeout(() => setCopied(false), 2000);
  };

  if (!business) {
    return (
      <div className="h-full flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 scanlines opacity-30 pointer-events-none" />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <Brain className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              Select a target to view intelligence
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 scanlines opacity-20 pointer-events-none" />
      <div className="absolute inset-0 grid-pattern pointer-events-none" />

      <div className="flex-1 p-4 space-y-4 overflow-auto relative z-10">
        {/* Target Header */}
        <div className="border border-primary/30 p-3 bg-secondary/50">
          <div className="flex items-center gap-2 mb-1">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Target Identified
            </span>
          </div>
          <h3 className="font-display text-lg font-bold text-foreground text-glow flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            {business.name}
          </h3>
        </div>

        {/* Sales Hook */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-warning" />
              <span className="font-display text-xs font-bold tracking-wider text-warning uppercase">
                Sales Hook
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="h-7 text-xs text-muted-foreground hover:text-primary"
            >
              {copied ? (
                <Check className="h-3 w-3 mr-1" />
              ) : (
                <Copy className="h-3 w-3 mr-1" />
              )}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <div className="border border-warning/30 bg-warning/5 p-3">
            <p className="text-foreground leading-relaxed text-sm">
              {business.notes || 'No sales intelligence available.'}
            </p>
          </div>
        </div>

        {/* Business Description */}
        <div className="space-y-2">
          <span className="font-display text-xs font-bold tracking-wider text-muted-foreground uppercase">
            Business Profile
          </span>
          <div className="border border-primary/20 bg-muted/30 p-3">
            <p className="text-muted-foreground text-sm leading-relaxed">
              {business.description || 'No description available.'}
            </p>
          </div>
        </div>

        {/* Why They Need a Website */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <span className="font-display text-xs font-bold tracking-wider text-primary uppercase">
              Why They Need a Website
            </span>
          </div>
          <div className="border border-primary/30 bg-primary/5 p-3">
            <ul className="space-y-1.5 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">›</span>
                <span>Invisible to 87% of consumers who search online first</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">›</span>
                <span>Competitors with websites capturing their market share</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">›</span>
                <span>No 24/7 presence to capture after-hours leads</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">›</span>
                <span>Missing opportunity to build trust and credibility</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
