import { useState } from 'react';
import { Mail, DollarSign, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Business, PACKAGES, PackageType } from '@/types/business';
import { sendEmail } from '@/lib/webhook';
import { generateStripePaymentLink } from '@/lib/stripe';
import { useToast } from '@/hooks/use-toast';

interface EmailInvoiceProps {
  business: Business | null;
}

export function EmailInvoice({ business }: EmailInvoiceProps) {
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [emailTo, setEmailTo] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const getAmount = (): number => {
    if (selectedPackage === 'Custom') {
      return parseFloat(customAmount) || 0;
    }
    const pkg = PACKAGES.find(p => p.id === selectedPackage);
    return pkg?.price || 0;
  };

  const handleSendInvoice = async () => {
    if (!business || !selectedPackage || !emailTo) {
      toast({
        title: 'Missing Information',
        description: 'Please select a package and enter an email address',
        variant: 'destructive',
      });
      return;
    }

    const amount = getAmount();
    if (amount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please select a package or enter a valid amount',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);

    // Create Stripe payment link
    const stripePaymentLink = generateStripePaymentLink(selectedPackage, amount, business.name);

    const selectedPkg = PACKAGES.find(p => p.id === selectedPackage);
    const monthlyFee = selectedPkg?.monthlyFee || 0;

    const subject = `Invoice for ${business.name} - Website Package`;
    const body = `Hi there,

Thank you for your interest in our website services!

Here's your invoice for ${business.name}:

Package: ${selectedPackage}
One-time setup: $${amount}
Monthly fee: $${monthlyFee}/month

To complete your payment, please visit:
${stripePaymentLink}

Once payment is received, we'll begin building your website immediately.

If you have any questions, feel free to reply to this email.

Best regards,
Your Team`;

    const success = await sendEmail(emailTo, subject, body, business.name);

    setIsSending(false);

    if (success) {
      toast({
        title: 'Invoice Sent!',
        description: `Invoice sent to ${emailTo}`,
      });
      // Reset form
      setSelectedPackage(null);
      setCustomAmount('');
      setEmailTo('');
    } else {
      toast({
        title: 'Failed to send invoice',
        description: 'Please try again or check your email configuration',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 border-b border-primary/20 pb-3 mb-4">
        <Mail className="h-4 w-4 text-primary" />
        <DollarSign className="h-4 w-4 text-primary" />
        <h3 className="font-display text-sm font-semibold tracking-wide text-primary">
          Email Invoice
        </h3>
      </div>

      <div className="space-y-4">
        {/* Business Info */}
        {business && (
          <div className="bg-secondary/30 border border-primary/20 p-3 rounded-lg">
            <p className="font-semibold text-sm">{business.name}</p>
            <p className="text-xs text-muted-foreground">{business.phone}</p>
          </div>
        )}

        {/* Email Input */}
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            Customer Email
          </label>
          <Input
            type="email"
            value={emailTo}
            onChange={(e) => setEmailTo(e.target.value)}
            placeholder="customer@example.com"
            className="cyber-input h-9 text-sm"
            disabled={!business}
          />
        </div>

        {/* Package Selection */}
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            Package
          </label>
          <Select
            value={selectedPackage || ''}
            onValueChange={(v) => setSelectedPackage(v as PackageType)}
            disabled={!business}
          >
            <SelectTrigger className="cyber-input h-9 text-sm">
              <SelectValue placeholder="Select package" />
            </SelectTrigger>
            <SelectContent className="bg-card border-primary/30">
              {PACKAGES.map((pkg) => (
                <SelectItem key={pkg.id} value={pkg.id}>
                  {pkg.icon} {pkg.name} - ${pkg.price} + ${pkg.monthlyFee}/mo
                </SelectItem>
              ))}
              <SelectItem value="Custom">✏️ Custom Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Custom Amount */}
        {selectedPackage === 'Custom' && (
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Custom Amount
            </label>
            <div className="flex items-center gap-2">
              <span className="text-success font-bold">$</span>
              <Input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Enter amount"
                className="cyber-input h-9 text-sm font-mono"
              />
            </div>
          </div>
        )}

        {/* Amount Preview */}
        {selectedPackage && selectedPackage !== 'Custom' && (
          <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg space-y-2">
            <div>
              <p className="text-xs text-muted-foreground mb-1">One-time Setup</p>
              <p className="font-mono text-2xl font-bold text-primary">
                ${getAmount()}
              </p>
            </div>
            <div className="pt-2 border-t border-primary/10">
              <p className="text-xs text-muted-foreground mb-1">Monthly Fee</p>
              <p className="font-mono text-lg font-semibold text-success">
                ${PACKAGES.find(p => p.id === selectedPackage)?.monthlyFee}/mo
              </p>
            </div>
          </div>
        )}
        {selectedPackage === 'Custom' && (
          <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Custom Amount</p>
            <p className="font-mono text-2xl font-bold text-primary">
              ${getAmount()}
            </p>
          </div>
        )}

        {/* Send Button */}
        <Button
          onClick={handleSendInvoice}
          disabled={!business || !selectedPackage || !emailTo || isSending}
          className="cyber-button h-10 w-full text-sm"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              SEND INVOICE
            </>
          )}
        </Button>

        <p className="text-[10px] text-muted-foreground text-center">
          Invoice will include Stripe payment link
        </p>
      </div>
    </div>
  );
}
