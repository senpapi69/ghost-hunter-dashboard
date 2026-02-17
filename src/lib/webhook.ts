import { Business } from '@/types/business';
import { GitHubCreatePayload, GitHubCreateResponse, RenderDeployResponse, RenderStatusResponse } from '@/types/webhooks';

// n8n REST API Configuration
const N8N_API_BASE_URL =
  import.meta.env.VITE_N8N_API_BASE_URL || 'https://n8n.dhud.tech';
const N8N_API_KEY = import.meta.env.VITE_N8N_API_KEY || '';

// External Traefik webhook URLs (accessible from browser)
const N8N_LOVABLE_DEPLOY_WEBHOOK_URL =
  import.meta.env.VITE_N8N_LOVABLE_DEPLOY_WEBHOOK_URL || 'https://n8n.dhud.tech/webhook/deploy-website';
const N8N_RENDER_DEPLOY_URL =
  import.meta.env.VITE_N8N_RENDER_DEPLOY_URL || 'https://n8n.dhud.tech/webhook/github-to-render';
const N8N_RENDER_DEPLOY_WEBHOOK_URL =
  import.meta.env.VITE_N8N_RENDER_DEPLOY_WEBHOOK_URL || 'https://n8n.dhud.tech/webhook/render-deploy';
const N8N_RENDER_STATUS_WEBHOOK_URL =
  import.meta.env.VITE_N8N_RENDER_STATUS_WEBHOOK_URL || 'https://n8n.dhud.tech/webhook/render-status';
const N8N_DEPLOY_AND_INVOICE_URL =
  import.meta.env.VITE_N8N_DEPLOY_AND_INVOICE_URL || 'https://n8n.dhud.tech/webhook/deploy-and-invoice';

// Demo mode - simulates successful webhook calls when real webhooks fail
const DEMO_MODE = false;

/**
 * Helper function to call n8n REST API
 */
async function callN8nAPI(endpoint: string, method: string = 'POST', data?: any): Promise<Response> {
  const url = `${N8N_API_BASE_URL}/api/v1${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  return response;
}

// n8n Workflow IDs (configure these in n8n)
const N8N_LOVABLE_DEPLOY_WORKFLOW_ID =
  import.meta.env.VITE_N8N_LOVABLE_DEPLOY_WORKFLOW_ID || '';

export interface DeployAndInvoicePayload {
  placeId: string;
  businessName: string;
  phone: string;
  address: string;
  email: string;
  package: string;
  amount: number;
}

export interface DeployAndInvoiceResponse {
  success: boolean;
  buildId?: string;
  paymentLink?: string;
  previewUrl?: string;
  isDemo?: boolean;
  error?: string;
}

export interface LovableDeployPayload {
  businessName: string;
  address: string;
  phone: string;
  email?: string;
  description?: string;
  notes?: string;
  rating?: number;
  package: string;
  amount: number;
}

export interface LovableDeployResponse {
  success: boolean;
  lovableUrl?: string;
  renderUrl?: string;
  githubRepo?: string;
  buildStatus?: string;
  error?: string;
}

export async function triggerDeployAndInvoice(
  payload: DeployAndInvoicePayload
): Promise<DeployAndInvoiceResponse> {
  const slug = payload.businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(N8N_DEPLOY_AND_INVOICE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString(),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Webhook returned ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      buildId: data.buildId,
      paymentLink: data.paymentLink,
      previewUrl: data.previewUrl,
    };
  } catch (error) {
    console.error('Deploy webhook failed:', error);

    if (DEMO_MODE) {
      console.log('Demo mode: Simulating successful deploy and invoice');
      await new Promise(resolve => setTimeout(resolve, 2500));
      return {
        success: true,
        buildId: `demo-${Date.now()}`,
        paymentLink: `https://buy.stripe.com/demo_${slug}`,
        previewUrl: `https://${slug}.onrender.com`,
        isDemo: true,
      };
    }

    return { success: false };
  }
}

/**
 * Step 1: Generate Lovable Build URL using n8n webhook
 * Returns a URL that auto-starts Lovable AI website builder
 */
export async function generateLovableBuildUrl(
  payload: LovableDeployPayload
): Promise<LovableDeployResponse> {
  const slug = payload.businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 seconds for Lovable API

    const response = await fetch(N8N_LOVABLE_DEPLOY_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        businessName: payload.businessName,
        address: payload.address,
        phone: payload.phone,
        email: payload.email,
        description: payload.description,
        notes: payload.notes,
        rating: payload.rating,
        package: payload.package,
        amount: payload.amount,
        timestamp: new Date().toISOString(),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    return {
      success: data.success ?? true,
      lovableUrl: data.lovableBuildUrl || data.lovableUrl,
      renderUrl: data.renderUrl,
      githubRepo: data.githubRepo,
      buildStatus: data.buildStatus || 'pending',
    };
  } catch (error) {
    console.error('Lovable URL generation failed:', error);

    if (DEMO_MODE) {
      console.log('Demo mode: Simulating Lovable URL generation');
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockPrompt = encodeURIComponent(`Create a professional website for ${payload.businessName}`);
      return {
        success: true,
        lovableUrl: `https://lovable.dev/?autosubmit=true#prompt=${mockPrompt}`,
        buildStatus: 'pending',
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate Lovable URL'
    };
  }
}

/**
 * Step 2: Deploy to Render from GitHub repo
 * Called after Lovable syncs to GitHub
 */
export async function deployToRenderFromGitHub(
  businessName: string,
  githubRepo: string
): Promise<{ success: boolean; renderUrl?: string; error?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const response = await fetch(N8N_RENDER_DEPLOY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        businessName,
        githubRepo,
        timestamp: new Date().toISOString(),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Webhook returned ${response.status}`);
    }

    const data = await response.json();
    return {
      success: data.success,
      renderUrl: data.renderUrl,
    };
  } catch (error) {
    console.error('Render deployment failed:', error);

    if (DEMO_MODE) {
      const slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await new Promise(resolve => setTimeout(resolve, 2000));
      return {
        success: true,
        renderUrl: `https://${slug}.onrender.com`,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Deployment failed'
    };
  }
}

/**
 * Legacy function for backward compatibility
 * Now uses the two-step process: Lovable URL generation → Render deployment
 */
export async function triggerLovableDeployment(
  payload: LovableDeployPayload
): Promise<LovableDeployResponse> {
  return generateLovableBuildUrl(payload);
}

/**
 * Deploy to Render from GitHub repo with polling support
 * Returns immediately with a job ID for status tracking
 */
export async function deployToRenderWithJobId(
  businessName: string,
  githubRepo: string
): Promise<RenderDeployResponse> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    // Normalize business name: lowercase, replace special chars with hyphens
    const normalizedName = businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const response = await fetch(N8N_RENDER_DEPLOY_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        repo_url: githubRepo,
        name: normalizedName,
        owner_id: "tea-d57vla3e5dus73dkar5g",
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Webhook returned ${response.status}`);
    }

    const data = await response.json();

    // Handle array response from n8n
    const result = Array.isArray(data) ? data[0] : data;

    return {
      success: result.success ?? true,
      jobId: result.service_id, // Use service_id as the job ID for polling
    };
  } catch (error) {
    console.error('Render deployment failed:', error);

    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        success: true,
        jobId: `demo-job-${Date.now()}`,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start deployment',
    };
  }
}

/**
 * Check Render deployment status
 * Used for polling the deployment progress
 */
export async function checkRenderDeploymentStatus(
  jobId: string
): Promise<RenderStatusResponse> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${N8N_RENDER_STATUS_WEBHOOK_URL}?jobId=${jobId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Status check returned ${response.status}`);
    }

    const data = await response.json();

    // Handle array response from n8n
    const result = Array.isArray(data) ? data[0] : data;

    // Map Render API status to our status
    // Check both 'status' and 'deploy_status' fields
    let status: 'queued' | 'building' | 'live' | 'failed' = 'building';

    const statusCode = result.status || result.deploy_status;

    // Debug logging
    console.log('Render status check:', {
      jobId: result.service_id || result.jobId,
      statusCode,
      rawStatus: result.status,
      rawDeployStatus: result.deploy_status,
    });

    if (statusCode === 'live' || statusCode === 'ready' || statusCode === 'success' || statusCode === 'succeeded') {
      status = 'live'; // Deployed successfully
      console.log('✅ Deployment live!');
    } else if (statusCode === 'failed' || statusCode === 'error') {
      status = 'failed'; // Deployment failed
      console.log('❌ Deployment failed');
    } else if (statusCode === null || statusCode === undefined || statusCode === 'building' || statusCode === 'created' || statusCode === 'queued') {
      status = 'building'; // Still deploying or waiting
      console.log('⏳ Still building...');
    }

    return {
      jobId: result.service_id || result.jobId,
      status,
      deployedUrl: result.deployedUrl || result.service_url,
      error: result.error,
      progress: result.message || result.progress,
      logs: result.logs,
    };
  } catch (error) {
    console.error('Status check failed:', error);

    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      // Demo mode: return success after 3 polls
      return {
        jobId,
        status: 'queued',
        error: undefined,
      };
    }

    return {
      jobId,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Status check failed',
    };
  }
}
