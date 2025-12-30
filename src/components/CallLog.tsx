import { useState } from 'react';
import {
  Phone,
  Check,
  X,
  Calendar,
  Ban,
  Star,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Business, CallOutcome } from '@/types/business';
import { useAppStore } from '@/stores/appStore';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface CallLogProps {
  business: Business | null;
}

const outcomeButtons: { outcome: CallOutcome; icon: typeof Check; label: string; color: string }[] = [
  { outcome: 'Answered', icon: Check, label: 'Answered', color: 'text-success hover:bg-success/20' },
  { outcome: 'No Answer', icon: X, label: 'No Answer', color: 'text-destructive hover:bg-destructive/20' },
  { outcome: 'Callback', icon: Calendar, label: 'Callback', color: 'text-warning hover:bg-warning/20' },
  { outcome: 'Not Interested', icon: Ban, label: 'Not Interested', color: 'text-muted-foreground hover:bg-muted' },
  { outcome: 'Interested', icon: Star, label: 'Interested', color: 'text-primary hover:bg-primary/20' },
];

export function CallLog({ business }: CallLogProps) {
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const { addCallLog, callLogs, incrementStat } = useAppStore();
  const { toast } = useToast();

  const handleOutcome = (outcome: CallOutcome) => {
    if (!business) return;

    addCallLog({
      id: `call-${Date.now()}`,
      businessId: business.id,
      businessName: business.name,
      outcome,
      notes,
      followUpDate: followUpDate ? new Date(followUpDate) : undefined,
      loggedAt: new Date(),
    });

    if (outcome === 'Interested') {
      incrementStat('conversions');
    }

    toast({
      title: 'Call Logged',
      description: `${business.name} - ${outcome}`,
    });

    setNotes('');
    setFollowUpDate('');
  };

  const recentCalls = callLogs.slice(0, 5);

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center gap-2 border-b border-primary/20 pb-2">
        <Phone className="h-4 w-4 text-primary" />
        <h3 className="font-display text-xs font-bold tracking-wider text-primary uppercase">
          Call Log
        </h3>
      </div>

      {business ? (
        <>
          {/* Quick Outcome Buttons */}
          <div className="flex flex-wrap gap-1">
            {outcomeButtons.map((btn) => (
              <Button
                key={btn.outcome}
                variant="ghost"
                size="sm"
                onClick={() => handleOutcome(btn.outcome)}
                className={cn('h-7 text-xs px-2', btn.color)}
                title={btn.label}
              >
                <btn.icon className="h-3 w-3" />
              </Button>
            ))}
          </div>

          {/* Notes */}
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Call notes..."
            className="cyber-input min-h-[60px] text-xs resize-none"
          />

          {/* Follow-up Date */}
          <div className="flex gap-2">
            <Input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="cyber-input text-xs flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => notes && handleOutcome('Answered')}
              className="border-primary/30 hover:bg-primary/10"
            >
              <Save className="h-3 w-3" />
            </Button>
          </div>
        </>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-2">
          Select a target to log calls
        </p>
      )}

      {/* Recent Calls */}
      {recentCalls.length > 0 && (
        <div className="border-t border-primary/20 pt-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
            Recent
          </p>
          <ScrollArea className="h-24">
            <div className="space-y-1">
              {recentCalls.map((call) => (
                <div
                  key={call.id}
                  className="text-xs flex items-center justify-between gap-2 py-1 border-b border-primary/5"
                >
                  <span className="truncate flex-1">{call.businessName}</span>
                  <span className="text-muted-foreground">{call.outcome}</span>
                  <span className="text-muted-foreground/50 text-[10px]">
                    {format(new Date(call.loggedAt), 'HH:mm')}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
