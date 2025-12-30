import { Sparkles, Brain, Target, AlertCircle } from 'lucide-react';
import { Business } from '@/types/business';
import { cn } from '@/lib/utils';

interface IntelligencePanelProps {
  business: Business | null;
}

export function IntelligencePanel({ business }: IntelligencePanelProps) {
  if (!business) {
    return (
      <div className="cyber-card h-full flex flex-col relative overflow-hidden">
        {/* Scanlines effect */}
        <div className="absolute inset-0 scanlines pointer-events-none opacity-50" />
        
        <div className="p-4 border-b border-primary/30">
          <h2 className="font-display text-sm font-bold tracking-wider text-muted-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            AI INTELLIGENCE
          </h2>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <Brain className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">
              Select a target to view intelligence briefing
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cyber-card h-full flex flex-col relative overflow-hidden">
      {/* Scanlines effect */}
      <div className="absolute inset-0 scanlines pointer-events-none opacity-30" />
      
      {/* Animated scan line */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent animate-scan opacity-50" />
      </div>
      
      <div className="p-4 border-b border-primary/30 relative z-10">
        <h2 className="font-display text-sm font-bold tracking-wider text-primary flex items-center gap-2">
          <Sparkles className="h-4 w-4 animate-pulse" />
          AI INTELLIGENCE
        </h2>
      </div>
      
      <div className="flex-1 p-6 space-y-6 overflow-auto relative z-10">
        {/* Target Header */}
        <div className="border border-primary/30 p-4 bg-secondary/50">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Target Identified
            </span>
          </div>
          <h3 className="font-display text-xl font-bold text-foreground text-glow">
            {business.name}
          </h3>
        </div>
        
        {/* Sales Hook */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-warning" />
            <span className="font-display text-xs font-bold tracking-wider text-warning uppercase">
              Sales Hook
            </span>
          </div>
          <div className="border border-warning/30 bg-warning/5 p-4">
            <p className="text-foreground leading-relaxed font-mono text-sm">
              {business.notes || 'No sales intelligence available for this target.'}
            </p>
          </div>
        </div>
        
        {/* Business Description */}
        <div className="space-y-3">
          <span className="font-display text-xs font-bold tracking-wider text-muted-foreground uppercase">
            Business Profile
          </span>
          <div className="border border-primary/20 bg-muted/30 p-4">
            <p className="text-muted-foreground text-sm leading-relaxed">
              {business.description || 'No description available.'}
            </p>
          </div>
        </div>
        
        {/* Why They Need a Website */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <span className="font-display text-xs font-bold tracking-wider text-primary uppercase">
              Why They Need a Website
            </span>
          </div>
          <div className="border border-primary/30 bg-primary/5 p-4">
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">›</span>
                <span>Currently invisible to 87% of consumers who search online before making a purchase decision</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">›</span>
                <span>Competitors with websites are capturing market share from online searches</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">›</span>
                <span>No way for customers to learn about services, hours, or contact outside business hours</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">›</span>
                <span>Missing opportunity to build credibility and trust with professional online presence</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
