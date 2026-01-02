import { useState } from 'react';
import { Send, MessageSquare, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Business } from '@/types/business';
import { sendSMS, sendEmail } from '@/lib/webhook';
import { useToast } from '@/hooks/use-toast';

interface QuickOutreachProps {
  business: Business | null;
}

const templates = {
  initial: {
    sms: "Hey [Business], I noticed you don't have a website yet. I build sites for businesses in Brisbane — can I show you a quick demo? Takes 2 mins.",
    email: {
      subject: 'Quick website demo for [Business]',
      body: "Hi there,\n\nI noticed [Business] doesn't have a website yet, and I wanted to reach out.\n\nI specialize in building simple, effective websites for local businesses. I'd love to show you a quick demo of what I can create for you.\n\nWould you be open to a 5-minute call this week?\n\nBest regards",
    },
  },
  followup: {
    sms: "Hi, just following up on my message about a website for [Business]. Still happy to show you what I can do. Let me know!",
    email: {
      subject: 'Following up - website for [Business]',
      body: "Hi,\n\nI wanted to follow up on my previous message about creating a website for [Business].\n\nI'm still available to show you a quick demo whenever works for you.\n\nLet me know if you're interested!\n\nBest regards",
    },
  },
  demo: {
    sms: "Hey! Your demo site is live: [URL]. Take a look and let me know what you think. Can jump on a quick call to walk through it.",
    email: {
      subject: 'Your demo website is ready!',
      body: "Great news!\n\nYour demo website is now live and ready for you to review:\n\n[URL]\n\nTake a look and let me know what you think. I'm happy to jump on a quick call to walk you through it.\n\nLooking forward to hearing from you!",
    },
  },
  custom: {
    sms: '',
    email: { subject: '', body: '' },
  },
};

type TemplateKey = keyof typeof templates;

export function QuickOutreach({ business }: QuickOutreachProps) {
  const [tab, setTab] = useState<'sms' | 'email'>('sms');
  const [template, setTemplate] = useState<TemplateKey>('initial');
  const [smsMessage, setSmsMessage] = useState('');
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const applyTemplate = (key: TemplateKey) => {
    setTemplate(key);
    const t = templates[key];
    const businessName = business?.name || '[Business]';

    if (tab === 'sms') {
      setSmsMessage(t.sms.replace(/\[Business\]/g, businessName));
    } else {
      setEmailSubject(t.email.subject.replace(/\[Business\]/g, businessName));
      setEmailBody(t.email.body.replace(/\[Business\]/g, businessName));
    }
  };

  const handleSendSMS = async () => {
    if (!business?.phone || !smsMessage) return;
    setIsSending(true);
    const success = await sendSMS(business.phone, smsMessage, business.name);
    setIsSending(false);

    if (success) {
      toast({ title: 'SMS Sent', description: `Message sent to ${business.name}` });
      setSmsMessage('');
    } else {
      toast({ title: 'Failed to send SMS', variant: 'destructive' });
    }
  };

  const handleSendEmail = async () => {
    if (!emailTo || !emailSubject || !emailBody) return;
    setIsSending(true);
    const success = await sendEmail(
      emailTo,
      emailSubject,
      emailBody,
      business?.name || ''
    );
    setIsSending(false);

    if (success) {
      toast({ title: 'Email Sent', description: `Email sent to ${emailTo}` });
      setEmailTo('');
      setEmailSubject('');
      setEmailBody('');
    } else {
      toast({ title: 'Failed to send email', variant: 'destructive' });
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 border-b border-primary/20 pb-3">
        <Send className="h-4 w-4 text-primary" />
        <h3 className="font-display text-sm font-semibold tracking-wide text-primary">
          Quick Outreach
        </h3>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as 'sms' | 'email')}>
        <TabsList className="grid w-full grid-cols-2 h-8">
          <TabsTrigger value="sms" className="text-xs">
            <MessageSquare className="h-3 w-3 mr-1" />
            SMS
          </TabsTrigger>
          <TabsTrigger value="email" className="text-xs">
            <Mail className="h-3 w-3 mr-1" />
            Email
          </TabsTrigger>
        </TabsList>

        <div className="mt-2">
          <Select value={template} onValueChange={(v) => applyTemplate(v as TemplateKey)}>
            <SelectTrigger className="cyber-input h-8 text-xs">
              <SelectValue placeholder="Template" />
            </SelectTrigger>
            <SelectContent className="bg-card border-primary/30">
              <SelectItem value="initial">Initial Outreach</SelectItem>
              <SelectItem value="followup">Follow-up</SelectItem>
              <SelectItem value="demo">Demo Ready</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="sms" className="mt-2 space-y-2">
          <Input
            value={business?.phone || ''}
            readOnly
            className="cyber-input h-8 text-xs"
            placeholder="Phone number"
          />
          <Textarea
            value={smsMessage}
            onChange={(e) => setSmsMessage(e.target.value)}
            placeholder="Message..."
            className="cyber-input min-h-[80px] text-xs resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">
              {smsMessage.length}/160
            </span>
            <Button
              onClick={handleSendSMS}
              disabled={!business?.phone || !smsMessage || isSending}
              className="cyber-button h-8 text-xs"
            >
              {isSending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  <Send className="h-3 w-3 mr-1" />
                  SEND SMS
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="email" className="mt-2 space-y-2">
          <Input
            value={emailTo}
            onChange={(e) => setEmailTo(e.target.value)}
            placeholder="Email address"
            className="cyber-input h-8 text-xs"
          />
          <Input
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            placeholder="Subject"
            className="cyber-input h-8 text-xs"
          />
          <Textarea
            value={emailBody}
            onChange={(e) => setEmailBody(e.target.value)}
            placeholder="Email body..."
            className="cyber-input min-h-[80px] text-xs resize-none"
          />
          <Button
            onClick={handleSendEmail}
            disabled={!emailTo || !emailSubject || !emailBody || isSending}
            className="cyber-button h-8 text-xs w-full"
          >
            {isSending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <>
                <Mail className="h-3 w-3 mr-1" />
                SEND EMAIL
              </>
            )}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
