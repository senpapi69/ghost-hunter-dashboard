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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Business, CallOutcome } from '@/types/business';
import { useAppStore } from '@/stores/appStore';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface CallLogProps {
  business: Business | null;
}

const outcomeButtons: { outcome: CallOutcome; icon: typeof Check; label: string; color: string; emoji: string }[] = [
  { outcome: 'Answered', icon: Check, label: 'Answered', color: 'text-emerald-500 hover:bg-emerald-500/10 border-emerald-500/30', emoji: '✅' },
  { outcome: 'No Answer', icon: X, label: 'No Answer', color: 'text-red-500 hover:bg-red-500/10 border-red-500/30', emoji: '❌' },
  { outcome: 'Callback', icon: Calendar, label: 'Callback', color: 'text-amber-500 hover:bg-amber-500/10 border-amber-500/30', emoji: '📅' },
  { outcome: 'Not Interested', icon: Ban, label: 'Not Interested', color: 'text-muted-foreground hover:bg-muted border-muted', emoji: '🚫' },
  { outcome: 'Interested', icon: Star, label: 'Interested', color: 'text-violet-500 hover:bg-violet-500/10 border-violet-500/30', emoji: '⭐' },
];

export function CallLog({ business }: CallLogProps) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [selectedOutcome, setSelectedOutcome] = useState<CallOutcome | null>(null);
  const { addCallLog, callLogs, incrementStat } = useAppStore();
  const { toast } = useToast();

  const handleSave = () => {
    if (!business || !selectedOutcome) return;

    addCallLog({
      id: `call-${Date.now()}`,
      businessId: business.id,
      businessName: business.name,
      outcome: selectedOutcome,
      notes,
      followUpDate: followUpDate ? new Date(followUpDate) : undefined,
      loggedAt: new Date(),
    });

    incrementStat('callsMade');
    
    if (selectedOutcome === 'Interested') {
      incrementStat('conversions');
    }

    toast({
      title: 'Call Logged',
      description: `${business.name} - ${selectedOutcome}`,
    });

    // Reset and close
    setNotes('');
    setFollowUpDate('');
    setSelectedOutcome(null);
    setOpen(false);
  };

  const recentCalls = callLogs.slice(0, 3);

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 border-b border-border pb-3 mb-4">
        <Phone className="h-4 w-4 text-primary" />
        <h3 className="font-display text-sm font-semibold text-foreground">
          Call Log
        </h3>
      </div>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setSelectedOutcome(null); setNotes(''); setFollowUpDate(''); } }}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full h-10"
            disabled={!business}
          >
            <Phone className="h-4 w-4 mr-2" />
            LOG CALL
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-card border-border max-w-md shadow-card-lg rounded-xl">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Log Call
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Record the outcome and notes from your call
            </DialogDescription>
          </DialogHeader>

          {business && (
            <div className="space-y-4 pt-2">
              {/* Business Name */}
              <div className="bg-secondary/30 border border-border p-3 rounded-lg">
                <h3 className="font-bold text-foreground">{business.name}</h3>
                <a href={`tel:${business.phone}`} className="text-sm text-primary hover:underline">{business.phone}</a>
              </div>

              {/* Outcome Buttons */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Outcome</p>
                <div className="grid grid-cols-5 gap-2">
                  {outcomeButtons.map((btn) => (
                    <button
                      key={btn.outcome}
                      onClick={() => setSelectedOutcome(btn.outcome)}
                      className={cn(
                        'h-16 flex flex-col items-center justify-center gap-1 border rounded-md transition-all',
                        selectedOutcome === btn.outcome
                          ? 'border-primary bg-primary/10'
                          : `border-border bg-secondary/30 ${btn.color}`
                      )}
                    >
                      <span className="text-lg">{btn.emoji}</span>
                      <span className="text-[9px] leading-tight text-center">{btn.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Notes</p>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Call notes..."
                  className="min-h-[80px] text-sm resize-none"
                />
              </div>

              {/* Follow-up Date */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Follow-up Date</p>
                <Input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="text-sm"
                />
              </div>

              {/* Save Button */}
              <Button
                onClick={handleSave}
                disabled={!selectedOutcome}
                className="w-full h-11"
              >
                <Save className="h-4 w-4 mr-2" />
                SAVE & CLOSE
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Recent Calls - compact list */}
      {recentCalls.length > 0 && (
        <div className="mt-3 pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground mb-1">
            Recent
          </p>
          <ScrollArea className="h-16">
            <div className="space-y-0.5">
              {recentCalls.map((call) => (
                <div
                  key={call.id}
                  className="text-xs flex items-center justify-between gap-1 py-0.5"
                >
                  <span className="truncate flex-1 text-muted-foreground">{call.businessName}</span>
                  <span className="text-primary/70">{call.outcome}</span>
                  <span className="text-muted-foreground/50">
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