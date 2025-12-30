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

const outcomeButtons: { outcome: CallOutcome; icon: typeof Check; label: string; color: string }[] = [
  { outcome: 'Answered', icon: Check, label: 'Answered', color: 'text-success hover:bg-success/20' },
  { outcome: 'No Answer', icon: X, label: 'No Answer', color: 'text-destructive hover:bg-destructive/20' },
  { outcome: 'Callback', icon: Calendar, label: 'Callback', color: 'text-warning hover:bg-warning/20' },
  { outcome: 'Not Interested', icon: Ban, label: 'Not Interested', color: 'text-muted-foreground hover:bg-muted' },
  { outcome: 'Interested', icon: Star, label: 'Interested', color: 'text-primary hover:bg-primary/20' },
];

export function CallLog({ business }: CallLogProps) {
  const [open, setOpen] = useState(false);
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

    incrementStat('callsMade');
    
    if (outcome === 'Interested') {
      incrementStat('conversions');
    }

    toast({
      title: 'Call Logged',
      description: `${business.name} - ${outcome}`,
    });

    setNotes('');
    setFollowUpDate('');
    setOpen(false);
  };

  const recentCalls = callLogs.slice(0, 3);

  return (
    <div className="p-3">
      <div className="flex items-center gap-2 border-b border-primary/20 pb-2 mb-3">
        <Phone className="h-4 w-4 text-primary" />
        <h3 className="font-display text-xs font-bold tracking-wider text-primary uppercase">
          Call Log
        </h3>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full cyber-button h-10"
            disabled={!business}
          >
            <Phone className="h-4 w-4 mr-2" />
            LOG CALL
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-card border-primary/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-primary flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Log Call — {business?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-2">
            {/* Quick Outcome Buttons */}
            <div>
              <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Outcome</p>
              <div className="grid grid-cols-5 gap-2">
                {outcomeButtons.map((btn) => (
                  <Button
                    key={btn.outcome}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOutcome(btn.outcome)}
                    className={cn('h-14 flex-col gap-1 border border-primary/20', btn.color)}
                    title={btn.label}
                  >
                    <btn.icon className="h-4 w-4" />
                    <span className="text-[10px]">{btn.label.split(' ')[0]}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Notes</p>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Call notes..."
                className="cyber-input min-h-[80px] text-sm resize-none"
              />
            </div>

            {/* Follow-up Date */}
            <div>
              <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Follow-up Date</p>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="cyber-input text-sm flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => notes && handleOutcome('Answered')}
                  className="border-primary/30 hover:bg-primary/10"
                >
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Recent Calls - compact list */}
      {recentCalls.length > 0 && (
        <div className="mt-3 pt-2 border-t border-primary/10">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
            Recent
          </p>
          <ScrollArea className="h-16">
            <div className="space-y-0.5">
              {recentCalls.map((call) => (
                <div
                  key={call.id}
                  className="text-[10px] flex items-center justify-between gap-1 py-0.5"
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