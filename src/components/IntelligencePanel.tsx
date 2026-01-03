import { Sparkles, Brain, Target, AlertCircle, Copy, Check, Bot, Loader2 } from 'lucide-react';
import { Business } from '@/types/business';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// AI Intel fetcher - configure your AI endpoint here
async function fetchAIIntel(business: Business): Promise<string> {
  const API_URL = import.meta.env.VITE_AI_API_URL || '';
  const API_KEY = import.meta.env.VITE_AI_API_KEY || '';

  if (!API_URL) {
    // Return placeholder if no API configured
    return `AI analysis for ${business.name} - Configure VITE_AI_API_URL and VITE_AI_API_KEY in .env`;
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        prompt: `Analyze this business for sales opportunities: ${business.name}, ${business.address}, Rating: ${business.rating}/5. Phone: ${business.phone}. Description: ${business.description || 'N/A'}`,
        business: business,
      }),
    });

    if (!response.ok) {
      throw new Error('AI request failed');
    }

    const data = await response.json();
    // Ensure we always return a string
    const result = data.response || data.content || data.message || data.text || data.output;
    if (typeof result === 'string') {
      return result;
    }
    return JSON.stringify(result || data, null, 2);
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : 'AI request failed');
  }
}

interface IntelligencePanelProps {
  business: Business | null;
}

export function IntelligencePanel({ business }: IntelligencePanelProps) {
  const [copied, setCopied] = useState(false);
  const [aiIntel, setAiIntel] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch AI intel when business changes
  useEffect(() => {
    if (!business) {
      setAiIntel(null);
      setAiError(null);
      setAiLoading(false);
      return;
    }

    let cancelled = false;
    setAiLoading(true);
    setAiError(null);

    fetchAIIntel(business)
      .then((intel) => {
        if (!cancelled) setAiIntel(intel);
      })
      .catch((err) => {
        if (!cancelled) {
          const errorMsg = err instanceof Error ? err.message : String(err || 'Failed to fetch AI intel');
          setAiError(errorMsg);
        }
      })
      .finally(() => {
        if (!cancelled) setAiLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business?.id]);

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
        <div className="border border-primary/30 p-4 bg-secondary/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              Target Identified
            </span>
          </div>
          <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            {typeof business.name === 'string' ? business.name : String(business.name || 'Unknown')}
          </h3>
        </div>

        {/* Sales Hook */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-warning" />
              <span className="font-display text-sm font-semibold tracking-wide text-warning">
                Sales Hook
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="h-8 text-xs text-muted-foreground hover:text-primary rounded-md"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 mr-1" />
              ) : (
                <Copy className="h-3.5 w-3.5 mr-1" />
              )}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <div className="border border-warning/30 bg-warning/5 p-4 rounded-lg">
            <p className="text-foreground leading-relaxed text-sm">
              {typeof business.notes === 'string' ? business.notes : (business.notes ? String(business.notes) : 'No sales intelligence available.')}
            </p>
          </div>
        </div>

        {/* Business Description */}
        <div className="space-y-3">
          <span className="font-display text-sm font-semibold tracking-wide text-muted-foreground">
            Business Profile
          </span>
          <div className="border border-primary/20 bg-muted/30 p-4 rounded-lg">
            <p className="text-muted-foreground text-sm leading-relaxed">
              {typeof business.description === 'string' ? business.description : (business.description ? String(business.description) : 'No description available.')}
            </p>
          </div>
        </div>

        {/* AI Intel */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            <span className="font-display text-sm font-semibold tracking-wide text-primary">
              AI Intel
            </span>
            {aiLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
          </div>
          <div className="border border-primary/30 bg-primary/5 p-4 rounded-lg">
            {aiLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Analyzing target...</span>
              </div>
            ) : aiError ? (
              <p className="text-destructive text-sm">{String(aiError)}</p>
            ) : aiIntel ? (
              <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">{String(aiIntel)}</p>
            ) : (
              <p className="text-muted-foreground text-sm">No AI intel available</p>
            )}
          </div>
        </div>

        {/* Why They Need a Website */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <span className="font-display text-sm font-semibold tracking-wide text-primary">
              Why They Need a Website
            </span>
          </div>
          <div className="border border-primary/30 bg-primary/5 p-4 rounded-lg">
            <ul className="space-y-2 text-sm">
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
