import { useState } from 'react';
import { Zap, DollarSign, Loader2, Copy, ExternalLink, Send, Check, CreditCard } from 'lucide-react';
import { Business, PACKAGES, PackageType, BuildStatus, PaymentStatus } from '@/types/business';
import { useAppStore } from '@/stores/appStore';
import { triggerDeployAndInvoice } from '@/lib/webhook';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface DeployInvoiceProps {
  business: Business | null;
}

export function DeployInvoice({ business }: DeployInvoiceProps) {
  const [open, setOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState<{
    paymentLink?: string;
    buildStatus: BuildStatus;
    paymentStatus: PaymentStatus;
    previewUrl?: string;
    amount: number;
    packageName: PackageType;
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
    if (!business || !selectedPackage) return;
    
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
    setOpen(false);
    
    const jobId = `build-${Date.now()}`;
    
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
        email: '', // Not used - payment happens on demo site
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
          amount,
          packageName: selectedPackage,
        });
        
        toast({
          title: 'Site Deploying!',
          description: 'Demo site with Stripe checkout is being built',
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
    } catch {
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
    
    setDeployResult(prev => prev ? { ...prev, paymentStatus: 'paid' } : null);
    triggerCelebration(business.name, deployResult.amount);
    
    toast({
      title: 'Payment Received!',
      description: `$${deployResult.amount.toLocaleString()} from ${business.name}`,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Demo link copied to clipboard',
    });
  };

  const resetDeploy = () => {
    setDeployResult(null);
    setSelectedPackage(null);
    setCustomAmount('');
  };

  return (
    <div className="p-3">
      <div className="flex items-center gap-2 border-b border-primary/20 pb-2 mb-3">
        <Zap className="h-4 w-4 text-primary" />
        <DollarSign className="h-4 w-4 text-primary" />
        <h3 className="font-display text-xs font-bold tracking-wider text-primary uppercase">
          Deploy & Invoice
        </h3>
      </div>

      {/* Deploying state */}
      {isDeploying && business && (
        <div className="space-y-3">
          <div className="bg-secondary/30 border border-warning/30 p-3 animate-pulse">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-warning" />
              <span className="font-bold text-foreground">{business.name}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Building demo site with Stripe checkout...</p>
          </div>
        </div>
      )}

      {/* If deployed, show status */}
      {deployResult && business && !isDeploying ? (
        <div className="space-y-3">
          {/* Business & Package Info */}
          <div className="bg-secondary/30 border border-primary/20 p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🏗️</span>
              <span className="font-bold text-foreground">{business.name}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Package: {deployResult.packageName} — <span className="text-success font-mono">${deployResult.amount.toLocaleString()}</span>
            </p>
          </div>

          {/* Build Status */}
          <div className="flex items-center justify-between py-2 border-b border-primary/10">
            <span className="text-xs text-muted-foreground">Build Status:</span>
            <span className={`text-xs font-mono ${
              deployResult.buildStatus === 'live' ? 'text-success' :
              deployResult.buildStatus === 'building' ? 'text-warning animate-pulse' :
              'text-muted-foreground'
            }`}>
              {deployResult.buildStatus === 'live' ? '✅ Live' :
               deployResult.buildStatus === 'building' ? '⏳ Building...' :
               deployResult.buildStatus}
            </span>
          </div>
          
          {/* Demo URL */}
          {deployResult.previewUrl && deployResult.buildStatus === 'live' && (
            <div className="flex items-center justify-between py-2 border-b border-primary/10">
              <span className="text-xs text-muted-foreground">Demo URL:</span>
              <a 
                href={deployResult.previewUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                View Demo <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          {/* Payment Status Box */}
          <div className={`p-4 border-2 transition-all ${
            deployResult.paymentStatus === 'paid' 
              ? 'border-success bg-success/10 glow-success' 
              : 'border-warning bg-warning/5 animate-pulse'
          }`}>
            <div className="flex items-center justify-center gap-2">
              {deployResult.paymentStatus === 'paid' ? (
                <>
                  <Check className="h-5 w-5 text-success" />
                  <span className="font-display font-bold text-success">PAID ✓</span>
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 text-warning" />
                  <span className="font-display font-bold text-warning">WAITING FOR PAYMENT</span>
                </>
              )}
            </div>
            <p className={`text-center font-mono text-xl font-bold mt-2 ${
              deployResult.paymentStatus === 'paid' ? 'text-success' : 'text-foreground'
            }`}>
              ${deployResult.amount.toLocaleString()}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            {deployResult.previewUrl && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs h-8" 
                onClick={() => copyToClipboard(deployResult.previewUrl!)}
              >
                <Copy className="h-3 w-3 mr-1" /> Copy Demo Link
              </Button>
            )}
            <Button variant="outline" size="sm" className="text-xs h-8">
              <Send className="h-3 w-3 mr-1" /> Resend to Customer
            </Button>
          </div>

          {/* Mark as Paid (for manual/cash payments) */}
          {deployResult.paymentStatus !== 'paid' && (
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs h-8 border-success/40 text-success hover:bg-success/10"
              onClick={handleMarkAsPaid}
            >
              <Check className="h-3 w-3 mr-1" />
              Mark as Paid (Cash/Transfer)
            </Button>
          )}

          {/* Reset Button */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-[10px] text-muted-foreground"
            onClick={resetDeploy}
          >
            Create New Deployment
          </Button>
        </div>
      ) : !isDeploying && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full cyber-button h-10"
              disabled={!business}
            >
              <Zap className="h-4 w-4 mr-2" />
              {business ? `DEPLOY SITE — ${business.name}` : 'DEPLOY SITE'}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0a0a0a] border-primary/50 max-w-lg glow-cyan">
            <DialogHeader>
              <DialogTitle className="font-display text-primary flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5" />
                Deploy Site
              </DialogTitle>
            </DialogHeader>
            
            {business && (
              <div className="space-y-4 pt-2">
                {/* Business Info */}
                <div className="bg-secondary/30 border border-primary/20 p-4">
                  <h3 className="font-bold text-foreground text-lg">{business.name}</h3>
                  <p className="text-sm text-muted-foreground">{business.phone}</p>
                  <p className="text-sm text-muted-foreground">{business.address}</p>
                </div>

                {/* Package Selection */}
                <div>
                  <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">Select Package</p>
                  <div className="grid grid-cols-2 gap-3">
                    {PACKAGES.map((pkg) => (
                      <button
                        key={pkg.id}
                        onClick={() => setSelectedPackage(pkg.id)}
                        className={`p-4 border transition-all text-center ${
                          selectedPackage === pkg.id
                            ? 'border-primary bg-primary/10 glow-cyan'
                            : 'border-primary/20 hover:border-primary/40 bg-secondary/30'
                        }`}
                      >
                        <div className="text-2xl mb-2">{pkg.icon}</div>
                        <div className="font-display text-sm font-bold uppercase">{pkg.name}</div>
                        <div className="text-success font-mono font-bold text-lg">${pkg.price}</div>
                        <div className="text-[11px] text-muted-foreground mt-1">{pkg.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Amount */}
                <button
                  onClick={() => setSelectedPackage('Custom')}
                  className={`w-full p-4 border transition-all ${
                    selectedPackage === 'Custom'
                      ? 'border-primary bg-primary/10 glow-cyan'
                      : 'border-primary/20 hover:border-primary/40 bg-secondary/30'
                  }`}
                >
                  <div className="flex items-center gap-2 justify-center">
                    <span className="text-xl">✏️</span>
                    <span className="font-display text-sm font-bold uppercase">Custom Amount</span>
                  </div>
                  {selectedPackage === 'Custom' && (
                    <div className="mt-3 flex items-center gap-2 max-w-xs mx-auto">
                      <span className="text-success font-bold text-xl">$</span>
                      <Input
                        type="number"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="cyber-input text-center font-mono text-lg"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}
                </button>

                {/* Deploy Button */}
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="ghost"
                    onClick={() => setOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeploy}
                    disabled={!selectedPackage || (selectedPackage === 'Custom' && getAmount() <= 0)}
                    className="flex-[2] cyber-button h-12 text-sm"
                  >
                    🚀 DEPLOY SITE
                    {getAmount() > 0 && <span className="ml-2">— ${getAmount().toLocaleString()}</span>}
                  </Button>
                </div>

                <p className="text-[10px] text-muted-foreground text-center">
                  Demo site will include Stripe checkout for customer payment
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}