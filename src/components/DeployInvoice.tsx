import { useState } from 'react';
import { Zap, DollarSign, Loader2, Copy, ExternalLink, Send, Check, AlertCircle } from 'lucide-react';
import { Business, PACKAGES, PackageType, BuildStatus, PaymentStatus } from '@/types/business';
import { useAppStore } from '@/stores/appStore';
import { triggerDeployAndInvoice } from '@/lib/webhook';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface DeployInvoiceProps {
  business: Business | null;
}

export function DeployInvoice({ business }: DeployInvoiceProps) {
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState<{
    paymentLink?: string;
    buildStatus: BuildStatus;
    paymentStatus: PaymentStatus;
    previewUrl?: string;
  } | null>(null);
  
  const { addBuildJob, updateBuildJob, incrementStat, triggerCelebration } = useAppStore();
  const { toast } = useToast();

  const getAmount = (): number => {
    if (selectedPackage === 'Custom') {
      return parseFloat(customAmount) || 0;
    }
    const pkg = PACKAGES.find(p => p.id === selectedPackage);
    return pkg?.price || 0;
  };

  const handleDeploy = async () => {
    if (!business || !selectedPackage || !email) return;
    
    const amount = getAmount();
    if (amount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      });
      return;
    }

    setIsDeploying(true);
    
    const jobId = `build-${Date.now()}`;
    
    // Add to build queue
    addBuildJob({
      id: jobId,
      businessId: business.id,
      businessName: business.name,
      package: selectedPackage,
      amount,
      status: 'queued',
      paymentStatus: 'pending',
      triggeredAt: new Date(),
    });

    try {
      const result = await triggerDeployAndInvoice({
        placeId: business.placeId,
        businessName: business.name,
        phone: business.phone,
        address: business.address,
        email,
        package: selectedPackage,
        amount,
      });

      if (result.success) {
        updateBuildJob(jobId, {
          status: 'building',
          previewUrl: result.previewUrl,
        });
        
        setDeployResult({
          paymentLink: result.paymentLink,
          buildStatus: 'building',
          paymentStatus: 'pending',
          previewUrl: result.previewUrl,
        });
        
        toast({
          title: 'Invoice Sent!',
          description: `Site building. Invoice sent to ${email}`,
        });

        // Simulate build completion after 3 seconds
        setTimeout(() => {
          updateBuildJob(jobId, { status: 'live' });
          setDeployResult(prev => prev ? { ...prev, buildStatus: 'live' } : null);
          incrementStat('sitesBuilt');
        }, 3000);
        
      } else {
        updateBuildJob(jobId, {
          status: 'error',
          errorMessage: result.error || 'Deployment failed',
        });
        
        toast({
          title: 'Deployment Failed',
          description: result.error || 'Something went wrong',
          variant: 'destructive',
        });
      }
    } catch (error) {
      updateBuildJob(jobId, {
        status: 'error',
        errorMessage: 'Network error',
      });
      
      toast({
        title: 'Error',
        description: 'Failed to connect to deployment service',
        variant: 'destructive',
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const handleMarkAsPaid = () => {
    if (!business || !deployResult) return;
    
    const amount = getAmount();
    setDeployResult(prev => prev ? { ...prev, paymentStatus: 'paid' } : null);
    
    // Trigger celebration
    triggerCelebration(business.name, amount);
    
    toast({
      title: 'Payment Recorded',
      description: `$${amount.toLocaleString()} marked as paid`,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Payment link copied to clipboard',
    });
  };

  if (!business) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-4">
          <Zap className="h-4 w-4" />
          <DollarSign className="h-4 w-4" />
          <span className="font-display text-sm font-bold tracking-wider">DEPLOY & INVOICE</span>
        </div>
        <div className="text-center py-8 text-muted-foreground text-sm">
          Select a business to deploy
        </div>
      </div>
    );
  }

  // If already deployed, show status
  if (deployResult) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-2 text-primary mb-4">
          <Zap className="h-4 w-4" />
          <DollarSign className="h-4 w-4" />
          <span className="font-display text-sm font-bold tracking-wider">DEPLOY & INVOICE</span>
        </div>

        <div className="space-y-4">
          {/* Business Info */}
          <div className="bg-secondary/30 border border-primary/10 p-3">
            <h3 className="font-bold text-foreground">{business.name}</h3>
            <p className="text-xs text-muted-foreground">{selectedPackage} — ${getAmount().toLocaleString()}</p>
          </div>

          {/* Status Display */}
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b border-primary/10">
              <span className="text-sm text-muted-foreground">Build Status:</span>
              <span className={`text-sm font-mono ${
                deployResult.buildStatus === 'live' ? 'text-success' :
                deployResult.buildStatus === 'building' ? 'text-warning animate-pulse' :
                'text-muted-foreground'
              }`}>
                {deployResult.buildStatus === 'live' ? '✅ Live' :
                 deployResult.buildStatus === 'building' ? '⏳ Building...' :
                 deployResult.buildStatus}
              </span>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b border-primary/10">
              <span className="text-sm text-muted-foreground">Payment Status:</span>
              <span className={`text-sm font-mono ${
                deployResult.paymentStatus === 'paid' ? 'text-success' :
                deployResult.paymentStatus === 'pending' ? 'text-warning' :
                'text-destructive'
              }`}>
                {deployResult.paymentStatus === 'paid' ? '💰 PAID' :
                 deployResult.paymentStatus === 'pending' ? '📧 Invoice Sent' :
                 'Failed'}
              </span>
            </div>
            
            {deployResult.previewUrl && deployResult.buildStatus === 'live' && (
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Preview:</span>
                <a 
                  href={deployResult.previewUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  View Demo <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            {deployResult.paymentLink && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => copyToClipboard(deployResult.paymentLink!)}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy Link
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <Send className="h-3 w-3 mr-1" />
              Resend
            </Button>
            {deployResult.paymentStatus !== 'paid' && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs col-span-2 border-success/40 text-success hover:bg-success/10"
                onClick={handleMarkAsPaid}
              >
                <Check className="h-3 w-3 mr-1" />
                Mark as Paid
              </Button>
            )}
          </div>

          {/* Reset Button */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs text-muted-foreground"
            onClick={() => {
              setDeployResult(null);
              setSelectedPackage(null);
              setCustomAmount('');
            }}
          >
            Create New Invoice
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 text-primary mb-4">
        <Zap className="h-4 w-4" />
        <DollarSign className="h-4 w-4" />
        <span className="font-display text-sm font-bold tracking-wider">DEPLOY & INVOICE</span>
      </div>

      {/* Business Info */}
      <div className="bg-secondary/30 border border-primary/10 p-3 mb-4">
        <h3 className="font-bold text-foreground">{business.name}</h3>
        <p className="text-xs text-muted-foreground">{business.phone} • {business.address}</p>
        <p className="text-[10px] text-muted-foreground/60 font-mono mt-1">ID: {business.placeId}</p>
      </div>

      {/* Package Selection */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {PACKAGES.map((pkg) => (
          <button
            key={pkg.id}
            onClick={() => setSelectedPackage(pkg.id)}
            className={`p-3 border transition-all text-center ${
              selectedPackage === pkg.id
                ? 'border-primary bg-primary/10 glow-cyan'
                : 'border-primary/20 hover:border-primary/40 bg-secondary/30'
            }`}
          >
            <div className="text-lg mb-1">{pkg.icon}</div>
            <div className="font-display text-xs font-bold uppercase">{pkg.name}</div>
            <div className="text-success font-mono font-bold">${pkg.price}</div>
            <div className="text-[10px] text-muted-foreground">{pkg.description}</div>
          </button>
        ))}
      </div>

      {/* Custom Amount */}
      <button
        onClick={() => setSelectedPackage('Custom')}
        className={`w-full p-3 border mb-4 transition-all ${
          selectedPackage === 'Custom'
            ? 'border-primary bg-primary/10 glow-cyan'
            : 'border-primary/20 hover:border-primary/40 bg-secondary/30'
        }`}
      >
        <div className="flex items-center gap-2 justify-center">
          <span className="text-lg">✏️</span>
          <span className="font-display text-xs font-bold uppercase">Custom Amount</span>
        </div>
        {selectedPackage === 'Custom' && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-success font-bold">$</span>
            <Input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Enter amount"
              className="cyber-input text-center font-mono"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </button>

      {/* Email Field */}
      <div className="mb-4">
        <label className="text-xs text-muted-foreground mb-1 block">Customer Email (for receipt)</label>
        <Input
          type="email"
          value={email || business.email || ''}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="customer@email.com"
          className="cyber-input"
        />
      </div>

      {/* Deploy Button */}
      <Button
        onClick={handleDeploy}
        disabled={!selectedPackage || !email || isDeploying || (selectedPackage === 'Custom' && getAmount() <= 0)}
        className="w-full cyber-button h-12 text-sm"
      >
        {isDeploying ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Deploying...
          </>
        ) : (
          <>
            🚀 DEPLOY & SEND INVOICE
            {getAmount() > 0 && <span className="ml-2">— ${getAmount().toLocaleString()}</span>}
          </>
        )}
      </Button>

      {(!selectedPackage || !email) && (
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          Select a package and enter email to continue
        </p>
      )}
    </div>
  );
}
