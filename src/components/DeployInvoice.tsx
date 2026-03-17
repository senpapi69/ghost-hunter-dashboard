import { useState, useEffect } from 'react';
import { Zap, DollarSign, Loader2, Copy, ExternalLink, Send, Check, CreditCard, Github, AlertCircle, Building, Rocket } from 'lucide-react';
import { Business, PACKAGES, PackageType, BuildStatus, PaymentStatus } from '@/types/business';
import { useAppStore } from '@/stores/appStore';
import { generateLovableBuildUrl, deployToRenderFromGitHub, deployToRenderWithJobId, checkRenderDeploymentStatus } from '@/lib/webhook';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface DeployInvoiceProps {
  business: Business | null;
}

type DeployStage =
  | 'initial'
  | 'lovable-ready'
  | 'github-ready'
  | 'render-deploying'
  | 'complete';

export function DeployInvoice({ business }: DeployInvoiceProps) {
  const [open, setOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStage, setDeployStage] = useState<DeployStage>('initial');
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
  const [pollingJobId, setPollingJobId] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const [renderDeployError, setRenderDeployError] = useState<string>('');

  const { incrementStat, triggerCelebration } = useAppStore();
  const { toast } = useToast();

  // Poll render-status webhook when we have a polling job ID
  useEffect(() => {
    if (!pollingJobId) return;

    const pollInterval = setInterval(async () => {
      try {
        setPollCount(prev => prev + 1);

        const status = await checkRenderDeploymentStatus(pollingJobId);

        if (status.status === 'live' && status.deployedUrl) {
          // Deployment complete
          clearInterval(pollInterval);
          setPollingJobId(null);
          setDeployResult(prev => prev ? {
            ...prev,
            renderUrl: status.deployedUrl,
            buildStatus: 'live',
          } : null);
          setDeployStage('complete');
          incrementStat('sitesBuilt');

          toast({
            title: 'Website Live! 🎉',
            description: 'Your website is now deployed on Render',
          });
        } else if (status.status === 'failed') {
          // Deployment failed
          clearInterval(pollInterval);
          setPollingJobId(null);
          setRenderDeployError(status.error || 'Deployment failed');
          setDeployStage('github-ready');

          toast({
            title: 'Deployment Failed',
            description: status.error || 'An error occurred during deployment',
            variant: 'destructive',
          });
        }
        // Otherwise keep polling (status is 'queued' or 'building')
      } catch (error) {
        console.error('Polling error:', error);
        // Continue polling on transient errors
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(pollInterval);
  }, [pollingJobId, incrementStat, toast]);

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

    try {
      toast({
        title: 'Generating Lovable Build URL',
        description: 'AI is creating your website prompt... This may take 30-60 seconds.',
        duration: 5000,
      });

      // Step 1: Generate Lovable Build URL
      const result = await generateLovableBuildUrl({
        businessName: business.name,
        phone: business.phone,
        address: business.address,
        email: business.email,
        description: business.description,
        notes: business.notes,
        rating: business.rating,
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

      } else {
        toast({
          title: 'Generation Failed',
          description: result.error || 'Something went wrong',
          variant: 'destructive',
        });
      }
    } catch (error) {
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

    setDeployStage('render-deploying' as DeployStage);
    setRenderDeployError('');
    setPollCount(0);

    try {
      toast({
        title: 'Deploying to Render',
        description: 'Starting deployment process...',
      });

      // Step 2: Deploy to Render from GitHub with job ID
      const result = await deployToRenderWithJobId(
        business.name,
        githubRepoInput
      );

      if (result.success && result.jobId) {
        // Start polling for deployment status
        setPollingJobId(result.jobId);

        toast({
          title: 'Deployment Started',
          description: 'Job ID: ' + result.jobId,
        });

        setDeployResult(prev => prev ? {
          ...prev,
          githubRepo: githubRepoInput,
        } : null);

      } else {
        const errorMsg = result.error || 'Failed to start deployment';
        setRenderDeployError(errorMsg);

        toast({
          title: 'Deployment Failed',
          description: errorMsg,
          variant: 'destructive',
        });
        setDeployStage('github-ready');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to deploy to Render';
      setRenderDeployError(errorMsg);

      toast({
        title: 'Error',
        description: errorMsg,
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
    setPollingJobId(null);
    setPollCount(0);
    setRenderDeployError('');
  };

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 border-b border-border pb-3 mb-4">
        <Zap className="h-4 w-4 text-primary" />
        <h3 className="font-display text-sm font-semibold text-foreground">
          Deploy & Invoice
        </h3>
      </div>

      {/* Deploying state */}
      {isDeploying && business && (
        <div className="space-y-3">
          <div className="bg-secondary/30 border border-border p-3">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-warning" />
              <span className="font-bold text-foreground">{business.name}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Initializing deployment...
            </p>
          </div>
        </div>
      )}

      {/* If deployed, show status */}
      {deployResult && business && !isDeploying ? (
        <div className="space-y-3">
          {/* Business & Package Info */}
          <div className="bg-secondary/30 border border-border p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Building className="h-4 w-4 text-foreground" />
              <span className="font-bold text-foreground">{business.name}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Package: {deployResult.packageName} — <span className="text-success font-mono">${deployResult.amount.toLocaleString()}</span>
            </p>
          </div>

          {/* Deployment Stage Progress */}
          <div className="bg-secondary/30 border border-border p-3 rounded-lg">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className={deployStage === 'lovable-ready' || deployStage === 'github-ready' || deployStage === 'render-deploying' || deployStage === 'complete' ? 'text-success' : 'text-muted-foreground'}>
                ✓ Lovable
              </span>
              <span className={
                deployStage === 'complete' ? 'text-success' :
                deployStage === 'render-deploying' ? 'text-warning' :
                deployStage === 'github-ready' ? 'text-warning' :
                'text-muted-foreground'
              }>
                {deployStage === 'github-ready' || deployStage === 'render-deploying' ? '→ Deploying' : '→'} Render
              </span>
              <span className={deployStage === 'complete' ? 'text-success' : 'text-muted-foreground'}>
                ✓ Live
              </span>
            </div>
          </div>

          {/* Step 1: Lovable URL Ready */}
          {deployStage === 'lovable-ready' && deployResult.lovableUrl && (
            <div className="bg-secondary/30 border border-border p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Rocket className="h-5 w-5 text-primary" />
                <h4 className="font-bold text-foreground">Step 1: Build in Lovable</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Lovable has opened in a new tab. Click "Publish to GitHub" when your site is ready.
              </p>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs border-border hover:bg-muted/50"
                  onClick={() => window.open(deployResult.lovableUrl, '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" /> Re-open Lovable
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="w-full text-xs bg-success hover:bg-success/90 text-white"
                  onClick={() => setDeployStage('github-ready')}
                >
                  <Check className="h-3 w-3 mr-1" /> I've Published to GitHub
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: GitHub to Render Deployment */}
          {deployStage === 'github-ready' && (
            <div className="bg-secondary/30 border border-border p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Github className="h-5 w-5 text-foreground" />
                <h4 className="font-bold text-foreground">Step 2: Deploy to Render</h4>
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
                  className="text-xs"
                />
                <Button
                  variant="default"
                  size="sm"
                  className="w-full text-xs"
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
            <div className="bg-secondary/30 border border-border p-4 rounded-lg">
              <div className="flex items-center gap-2 justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-warning" />
                <span className="font-bold text-warning">
                  {pollCount === 0 ? 'Starting deployment...' : `Deploying to Render... (${pollCount} checks)`}
                </span>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                {pollCount < 6
                  ? 'Checking deployment status every 30 seconds...'
                  : 'Still deploying... This can take 2-3 minutes for new services'}
              </p>
              {pollCount >= 6 && (
                <p className="text-xs text-muted-foreground text-center mt-1">
                  (Poll count: {pollCount})
                </p>
              )}
            </div>
          )}

          {/* Show error if deployment fails */}
          {deployStage === 'github-ready' && renderDeployError && (
            <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 justify-center">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <span className="font-bold text-destructive">Deployment Failed</span>
              </div>
              <p className="text-xs text-destructive text-center mt-2">
                {renderDeployError}
              </p>
              <p className="text-xs text-muted-foreground text-center mt-1">
                Please check your GitHub repo URL and try again
              </p>
            </div>
          )}

          {/* Website URLs - Show when complete */}
          {deployStage === 'complete' && (
            <>
              {deployResult.lovableUrl && (
                <div className="flex items-center justify-between py-2 border-b border-border/50">
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
                <div className="flex items-center justify-between py-2 border-b border-border/50">
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
                <div className="flex items-center justify-between py-2 border-b border-border/50">
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
          <div className={`p-4 border-2 rounded-xl transition-all ${
            deployResult.paymentStatus === 'paid'
              ? 'border-success bg-success/10'
              : 'border-warning bg-warning/5'
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
                  className="w-full text-xs h-8 border-success text-success hover:bg-success/10"
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
            className="w-full text-xs text-muted-foreground"
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
              className="w-full h-10"
              disabled={!business}
            >
              <Zap className="h-4 w-4 mr-2" />
              {business ? `DEPLOY SITE — ${business.name}` : 'DEPLOY SITE'}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-lg shadow-card-lg rounded-xl">
            <DialogHeader>
              <DialogTitle className="font-display text-foreground flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5" />
                Deploy Site
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                Select a package and deploy a professional website for your customer
              </DialogDescription>
            </DialogHeader>

            {business && (
              <div className="space-y-4 pt-2">
                {/* Business Info */}
                <div className="bg-secondary/30 border border-border p-4 rounded-lg">
                  <h3 className="font-bold text-foreground text-lg">{business.name}</h3>
                  <p className="text-sm text-muted-foreground">{business.phone}</p>
                  <p className="text-sm text-muted-foreground">{business.address}</p>
                </div>

                {/* Package Selection */}
                <div>
                  <p className="text-xs text-muted-foreground mb-3">Select Package</p>
                  <div className="grid grid-cols-2 gap-3">
                    {PACKAGES.map((pkg) => (
                      <button
                        key={pkg.id}
                        onClick={() => setSelectedPackage(pkg.id)}
                        className={`p-4 border transition-all text-center rounded-lg ${
                          selectedPackage === pkg.id
                            ? 'border-primary bg-primary/10 shadow-card'
                            : 'border-border hover:border-border/60 bg-secondary/30'
                        }`}
                      >
                        <div className="text-2xl mb-2">{pkg.icon}</div>
                        <div className="font-display text-sm font-bold uppercase">{pkg.name}</div>
                        <div className="text-success font-mono font-bold text-lg">${pkg.price}</div>
                        <div className="text-xs text-primary font-semibold mt-1">+${pkg.monthlyFee}/mo</div>
                        <div className="text-xs text-muted-foreground mt-1">{pkg.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Amount */}
                <button
                  onClick={() => setSelectedPackage('Custom')}
                  className={`w-full p-4 border transition-all rounded-lg ${
                    selectedPackage === 'Custom'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-border/60 bg-secondary/30'
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
                        className="text-center font-mono text-lg"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}
                </button>

                {/* Deploy Button - Manual Flow Only */}
                <div className="pt-2">
                  <Button
                    onClick={handleDeploy}
                    disabled={!selectedPackage || (selectedPackage === 'Custom' && getAmount() <= 0)}
                    className="w-full h-12 text-sm"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Deploy Site
                    {getAmount() > 0 && <span className="ml-2">— ${getAmount().toLocaleString()}</span>}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Manual flow: Generate site in Lovable → Publish to GitHub → Deploy to Render
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
