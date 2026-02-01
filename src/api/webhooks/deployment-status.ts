/**
 * Deployment Status Webhook Handler
 * Task Group 5: Webhook Receiver Endpoint
 *
 * Receives deployment status updates from n8n and updates the Zustand store
 * Endpoint: /api/webhooks/deployment-status
 * Method: POST
 * Authentication: X-Webhook-Secret header
 */

import { DeploymentStatusWebhook } from '@/types/webhooks';
import { useAppStore } from '@/stores/appStore';
import { toast } from '@/hooks/use-toast';

const WEBHOOK_SECRET_KEY = import.meta.env.VITE_WEBHOOK_SECRET_KEY || '';

/**
 * Validate webhook authentication
 */
function validateWebhookAuth(secret: string | null): boolean {
  if (!WEBHOOK_SECRET_KEY) {
    console.error('WEBHOOK_SECRET_KEY not configured');
    return false;
  }

  if (!secret) {
    console.error('Missing X-Webhook-Secret header');
    return false;
  }

  return secret === WEBHOOK_SECRET_KEY;
}

/**
 * Map Render deployment status to BuildStatus
 */
function mapDeploymentStatus(status: string): 'queued' | 'building' | 'github-creating' | 'render-provisioning' | 'auto-deploying' | 'live' | 'error' {
  switch (status) {
    case 'live':
      return 'live';
    case 'failed':
      return 'error';
    case 'deploying':
      return 'auto-deploying';
    case 'pending':
      return 'queued';
    default:
      return 'queued';
  }
}

/**
 * Handle deployment status webhook from n8n
 * This function is called when n8n sends deployment status updates
 */
export async function handleDeploymentStatusWebhook(
  payload: DeploymentStatusWebhook,
  secret: string | null
): Promise<{ success: boolean; message: string }> {
  // Validate authentication
  if (!validateWebhookAuth(secret)) {
    console.error('Webhook authentication failed');
    return { success: false, message: 'Unauthorized' };
  }

  try {
    // Validate required fields
    if (!payload.businessId || !payload.status) {
      console.error('Invalid webhook payload: missing required fields');
      return { success: false, message: 'Invalid payload' };
    }

    // Log webhook payload for debugging (development only)
    if (import.meta.env.DEV) {
      console.log('📥 Deployment Status Webhook received:', {
        businessId: payload.businessId,
        status: payload.status,
        renderUrl: payload.renderUrl,
        timestamp: payload.timestamp,
      });
    }

    // Find the build job by businessId
    const store = useAppStore.getState();
    const buildJob = store.buildJobs.find(job => job.businessId === payload.businessId);

    if (!buildJob) {
      console.warn(`Build job not found for businessId: ${payload.businessId}`);
      // Still return success to prevent webhook retries
      return { success: true, message: 'Status received (no matching build job)' };
    }

    // Map status and update build job
    const mappedStatus = mapDeploymentStatus(payload.status);

    const updates: Partial<{
      status: 'queued' | 'building' | 'github-creating' | 'render-provisioning' | 'auto-deploying' | 'live' | 'error';
      previewUrl: string;
      errorMessage: string;
      deploymentStatus: 'pending' | 'deploying' | 'live' | 'failed';
    }> = {
      status: mappedStatus,
      deploymentStatus: payload.status as 'pending' | 'deploying' | 'live' | 'failed',
    };

    // Add preview URL if provided
    if (payload.renderUrl) {
      updates.previewUrl = payload.renderUrl;
    }

    // Add error message if failed
    if (payload.status === 'failed' && payload.error) {
      updates.errorMessage = payload.error;
    }

    // Update the build job in Zustand store
    store.updateBuildJob(buildJob.id, updates);

    // Trigger toast notification for status changes
    if (payload.status === 'live') {
      toast({
        title: 'Website Live! 🎉',
        description: `${buildJob.businessName} is now deployed`,
        duration: 5000,
      });
    } else if (payload.status === 'failed') {
      toast({
        title: 'Deployment Failed',
        description: payload.error || 'An error occurred during deployment',
        variant: 'destructive',
        duration: 7000,
      });
    } else if (payload.status === 'deploying') {
      toast({
        title: 'Deploying...',
        description: `${buildJob.businessName} deployment is in progress`,
        duration: 3000,
      });
    }

    return { success: true, message: 'Status received and processed' };
  } catch (error) {
    console.error('Error processing deployment status webhook:', error);
    // Still return success to prevent webhook retries for processing errors
    return { success: true, message: 'Status received (processing error logged)' };
  }
}

/**
 * Parse webhook request from Request object
 * For use with server-side webhook handlers
 */
export async function parseDeploymentStatusRequest(request: Request): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> {
  try {
    // Extract webhook secret from headers
    const secret = request.headers.get('X-Webhook-Secret');

    // Parse JSON body
    const payload: DeploymentStatusWebhook = await request.json();

    // Handle webhook
    const result = await handleDeploymentStatusWebhook(payload, secret);

    return {
      success: result.success,
      message: result.message,
      data: payload,
    };
  } catch (error) {
    console.error('Error parsing deployment status request:', error);
    return {
      success: false,
      message: 'Invalid JSON payload',
    };
  }
}

/**
 * Vite plugin for handling webhook requests during development
 * This adds a mock webhook endpoint for local development
 */
export function createDevelopmentWebhookHandler() {
  if (typeof window === 'undefined' || !import.meta.env.DEV) {
    return;
  }

  // Expose webhook handler to window for manual testing
  (window as any).__testDeploymentWebhook = async (payload: DeploymentStatusWebhook) => {
    const secret = WEBHOOK_SECRET_KEY;
    return await handleDeploymentStatusWebhook(payload, secret);
  };

  console.log('🔧 Development webhook handler available at window.__testDeploymentWebhook');
}
