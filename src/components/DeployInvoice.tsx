import { useState } from 'react';
import { Zap, DollarSign, Loader2, Copy, ExternalLink, Send, Check, CreditCard, Github } from 'lucide-react';
import { Business, PACKAGES, PackageType, BuildStatus, PaymentStatus } from '@/types/business';
import { useAppStore } from '@/stores/appStore';
import { generateLovableBuildUrl, deployToRenderFromGitHub } from '@/lib/webhook';
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
  const [deployStage, setDeployStage] = useState<'initial' | 'lovable-ready' | 'github-ready' | 'render-deploying' | 'complete'>('initial');
  const [githubRepoInput, setGithubRepoInput] = useState<string>('');
  const [deployResult, setDeployResult] = useState<{
    lovableUrl?: string;
    renderUrl?: string;
    githubRepo?: string;
    buildStatus: BuildStatus;
    paymentStatus: PaymentStatus;
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
      toast({
        title: 'Generating Lovable Build URL',
        description: 'AI is creating your website prompt...',
      });

      // Step 1: Generate Lovable Build URL
      const result = await generateLovableBuildUrl({
        businessName: business.name,
        phone: business.phone,
        address: business.address,
        package: selectedPackage,
        amount,
      });

      if (result.success && result.lovableUrl) {
        setDeployResult({
          lovableUrl: result.lovableUrl,
          buildStatus: 'building',
          paymentStatus: 'pending',
          amount,
          packageName: selectedPackage,
        });

        setDeployStage('lovable-ready');

        toast({
          title: 'Lovable URL Ready! 🚀',
          description: 'Opening Lovable in new tab. Click "Publish to GitHub" when ready.',
        });

        // Auto-open Lovable URL in new tab
        window.open(result.lovableUrl, '_blank');

        updateBuildJob(jobId, {
          status: 'building',
          previewUrl: result.lovableUrl,
        });

      } else {
        updateBuildJob(jobId, {
          status: 'error',
          errorMessage: result.error || 'Failed to generate Lovable URL',
        });

        toast({
          title: 'Generation Failed',
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

  const handleRenderDeploy = async () => {
    if (!business || !deployResult || !githubRepoInput) {
      toast({
        title: 'Missing Information',
        description: 'Please enter the GitHub repository URL',
        variant: 'destructive',
      });
      return;
    }

    setDeployStage('render-deploying');

    try {
      toast({
        title: 'Deploying to Render',
        description: 'This may take 2-3 minutes...',
      });

      // Step 2: Deploy to Render from GitHub
      const result = await deployToRenderFromGitHub(
        business.name,
        githubRepoInput
      );

      if (result.success && result.renderUrl) {
        setDeployResult(prev => prev ? {
          ...prev,
          renderUrl: result.renderUrl,
          githubRepo: githubRepoInput,
          buildStatus: 'live',
        } : null);

        setDeployStage('complete');

        incrementStat('sitesBuilt');

        toast({
          title: 'Website Live! 🎉',
          description: 'Your website is now deployed on Render',
        });

      } else {
        toast({
          title: 'Deployment Failed',
          description: result.error || 'Failed to deploy to Render',
          variant: 'destructive',
        });
        setDeployStage('github-ready');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to deploy to Render',
        variant: 'destructive',
      });
      setDeployStage('github-ready');
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
    setDeployStage('initial');
    setGithubRepoInput('');
  };

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 border-b border-primary/20 pb-3 mb-4">
        <Zap className="h-4 w-4 text-primary" />
        <DollarSign className="h-4 w-4 text-primary" />
        <h3 className="font-display text-sm font-semibold tracking-wide text-primary">
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

          {/* Deployment Stage Progress */}
          <div className="bg-secondary/30 border border-primary/20 p-3">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className={deployStage === 'lovable-ready' || deployStage === 'github-ready' || deployStage === 'render-deploying' || deployStage === 'complete' ? 'text-success' : 'text-muted-foreground'}>
                ✓ Lovable URL
              </span>
              <span className={deployStage === 'github-ready' || deployStage === 'render-deploying' || deployStage === 'complete' ? 'text-success' : 'text-muted-foreground'}>
                → GitHub
              </span>
              <span className={deployStage === 'render-deploying' || deployStage === 'complete' ? 'text-warning animate-pulse' : deployStage === 'complete' ? 'text-success' : 'text-muted-foreground'}>
                → Render
              </span>
              <span className={deployStage === 'complete' ? 'text-success' : 'text-muted-foreground'}>
                ✓ Live
              </span>
            </div>
          </div>

          {/* Step 1: Lovable URL Ready */}
          {deployStage === 'lovable-ready' && deployResult.lovableUrl && (
            <div className="bg-warning/10 border border-warning/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🚀</span>
                <h4 className="font-bold text-warning">Step 1: Build in Lovable</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Lovable has opened in a new tab. Click "Publish to GitHub" when your site is ready.
              </p>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs border-primary/40 hover:bg-primary/10"
                  onClick={() => window.open(deployResult.lovableUrl, '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" /> Re-open Lovable
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="w-full text-xs bg-success hover:bg-success/80"
                  onClick={() => setDeployStage('github-ready')}
                >
                  <Check className="h-3 w-3 mr-1" /> I've Published to GitHub
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: GitHub to Render Deployment */}
          {deployStage === 'github-ready' && (
            <div className="bg-primary/10 border border-primary/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Github className="h-5 w-5 text-primary" />
                <h4 className="font-bold text-primary">Step 2: Deploy to Render</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Enter your GitHub repository URL (from Lovable):
              </p>
              <div className="space-y-2">
                <Input
                  type="text"
                  value={githubRepoInput}
                  onChange={(e) => setGithubRepoInput(e.target.value)}
                  placeholder="https://github.com/username/repo"
                  className="cyber-input text-xs"
                />
                <Button
                  variant="default"
                  size="sm"
                  className="w-full text-xs cyber-button"
                  onClick={handleRenderDeploy}
                  disabled={!githubRepoInput}
                >
                  <Zap className="h-3 w-3 mr-1" /> Deploy to Render
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Deploying to Render */}
          {deployStage === 'render-deploying' && (
            <div className="bg-warning/10 border border-warning/30 p-4 animate-pulse">
              <div className="flex items-center gap-2 justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-warning" />
                <span className="font-bold text-warning">Deploying to Render...</span>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                This may take 2-3 minutes
              </p>
            </div>
          )}

          {/* Website URLs - Show when complete */}
          {deployStage === 'complete' && (
            <>
              {deployResult.lovableUrl && (
                <div className="flex items-center justify-between py-2 border-b border-primary/10">
                  <span className="text-xs text-muted-foreground">Lovable URL:</span>
                  <a
                    href={deployResult.lovableUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    View on Lovable <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              {deployResult.renderUrl && (
                <div className="flex items-center justify-between py-2 border-b border-primary/10">
                  <span className="text-xs text-muted-foreground">Live Site:</span>
                  <a
                    href={deployResult.renderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-success hover:underline flex items-center gap-1 font-semibold"
                  >
                    View Live Site <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              {deployResult.githubRepo && (
                <div className="flex items-center justify-between py-2 border-b border-primary/10">
                  <span className="text-xs text-muted-foreground">GitHub:</span>
                  <a
                    href={deployResult.githubRepo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <Github className="h-3 w-3" /> View Code
                  </a>
                </div>
              )}
            </>
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

          {/* Quick Actions - Only show when complete */}
          {deployStage === 'complete' && (
            <>
              <div className="grid grid-cols-2 gap-2">
                {deployResult.renderUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => copyToClipboard(deployResult.renderUrl!)}
                  >
                    <Copy className="h-3 w-3 mr-1" /> Copy Live Link
                  </Button>
                )}
                {deployResult.githubRepo && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => window.open(deployResult.githubRepo, '_blank')}
                  >
                    <Github className="h-3 w-3 mr-1" /> View Code
                  </Button>
                )}
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
            </>
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
          <DialogContent className="bg-background border-primary/40 max-w-lg shadow-2xl">
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
                        className={`p-4 border transition-all text-center rounded-lg ${
                          selectedPackage === pkg.id
                            ? 'border-primary bg-primary/10 shadow-lg'
                            : 'border-primary/20 hover:border-primary/40 bg-secondary/30'
                        }`}
                      >
                        <div className="text-2xl mb-2">{pkg.icon}</div>
                        <div className="font-display text-sm font-bold uppercase">{pkg.name}</div>
                        <div className="text-success font-mono font-bold text-lg">${pkg.price}</div>
                        <div className="text-xs text-primary font-semibold mt-1">+${pkg.monthlyFee}/mo</div>
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
                  AI will generate a professional website and deploy to Render (3-4 min)
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}