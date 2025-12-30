import { useState, useEffect } from 'react';
import { Zap, DollarSign, Loader2, Copy, ExternalLink, Send, Check } from 'lucide-react';
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

  // Pre-fill email when business changes
  useEffect(() => {
    if (business?.email) {
      setEmail(business.email);
    }
  }, [business?.email]);

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
    
    const amount = getAmount();
    setDeployResult(prev => prev ? { ...prev, paymentStatus: 'paid' } : null);
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

      {/* If deployed, show status inline */}
      {deployResult && business ? (
        <div className="space-y-3">
          <div className="bg-secondary/30 border border-primary/10 p-2 text-xs">
            <span className="font-bold">{business.name}</span>
            <span className="text-muted-foreground ml-2">{selectedPackage} — ${getAmount().toLocaleString()}</span>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Build:</span>
              <span className={deployResult.buildStatus === 'live' ? 'text-success' : 'text-warning animate-pulse'}>
                {deployResult.buildStatus === 'live' ? '✅ Live' : '⏳ Building...'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment:</span>
              <span className={deployResult.paymentStatus === 'paid' ? 'text-success' : 'text-warning'}>
                {deployResult.paymentStatus === 'paid' ? '💰 PAID' : '📧 Sent'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1">
            {deployResult.paymentLink && (
              <Button variant="outline" size="sm" className="text-[10px] h-7" onClick={() => copyToClipboard(deployResult.paymentLink!)}>
                <Copy className="h-3 w-3 mr-1" /> Copy Link
              </Button>
            )}
            {deployResult.paymentStatus !== 'paid' && (
              <Button variant="outline" size="sm" className="text-[10px] h-7 border-success/40 text-success" onClick={handleMarkAsPaid}>
                <Check className="h-3 w-3 mr-1" /> Paid
              </Button>
            )}
          </div>

          <Button variant="ghost" size="sm" className="w-full text-[10px] text-muted-foreground" onClick={resetDeploy}>
            New Invoice
          </Button>
        </div>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full cyber-button h-10"
              disabled={!business}
            >
              <Zap className="h-4 w-4 mr-2" />
              DEPLOY SITE
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-primary/30 max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display text-primary flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <DollarSign className="h-4 w-4" />
                Deploy & Invoice — {business?.name}
              </DialogTitle>
            </DialogHeader>
            
            {business && (
              <div className="space-y-4 pt-2">
                {/* Business Info */}
                <div className="bg-secondary/30 border border-primary/10 p-3">
                  <h3 className="font-bold text-foreground">{business.name}</h3>
                  <p className="text-xs text-muted-foreground">{business.phone} • {business.address}</p>
                  <p className="text-[10px] text-muted-foreground/60 font-mono mt-1">ID: {business.placeId}</p>
                </div>

                {/* Package Selection */}
                <div className="grid grid-cols-2 gap-2">
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
                  className={`w-full p-3 border transition-all ${
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
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Customer Email (for receipt)</label>
                  <Input
                    type="email"
                    value={email}
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
                  <p className="text-[10px] text-muted-foreground text-center">
                    Select a package and enter email to continue
                  </p>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}