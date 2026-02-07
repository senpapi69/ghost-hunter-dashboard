import { Business } from '@/types/business';
import { GitHubCreatePayload, GitHubCreateResponse } from '@/types/webhooks';

// n8n REST API Configuration
const N8N_API_BASE_URL =
  import.meta.env.VITE_N8N_API_BASE_URL || 'https://n8n-cors-handler.bigbbghud.workers.dev';
const N8N_API_KEY = import.meta.env.VITE_N8N_API_KEY || '';

// Legacy webhook URLs (for fallback)
const N8N_WEBHOOK_URL =
  import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://n8n.hudsond.me/webhook/build-site';
const N8N_SMS_WEBHOOK_URL =
  import.meta.env.VITE_N8N_SMS_WEBHOOK_URL || 'https://n8n.hudsond.me/webhook/send-sms';
const N8N_EMAIL_WEBHOOK_URL =
  import.meta.env.VITE_N8N_EMAIL_WEBHOOK_URL || 'https://n8n.hudsond.me/webhook/send-email';

// Demo mode - simulates successful webhook calls when real webhooks fail
const DEMO_MODE = false;

/**
 * Helper function to call n8n REST API through Cloudflare Worker
 *
 * Note: API key is NOT sent from client. The Cloudflare Worker adds the
 * N8N_API_KEY from its environment variables when forwarding to n8n.
 * This keeps the API key secure on the server-side.
 */
async function callN8nAPI(endpoint: string, method: string = 'POST', data?: any): Promise<Response> {
  const url = `${N8N_API_BASE_URL}/api/v1${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // API key is added by the Cloudflare Worker, not the client
  // This keeps credentials secure on the server side

  const response = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  return response;
}

export async function triggerWebsiteBuild(
  business: Business
): Promise<{ success: boolean; demoUrl?: string; isDemo?: boolean }> {
  const slug = business.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const demoUrl = `${slug}.onrender.com`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        placeId: business.placeId,
        businessName: business.name,
        phone: business.phone,
        address: business.address,
        timestamp: new Date().toISOString(),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Webhook returned ${response.status}`);
    }

    return { success: true, demoUrl };
  } catch (error) {
    console.error('Webhook failed:', error);

    // In demo mode, simulate success after webhook failure
    if (DEMO_MODE) {
      console.log('Demo mode: Simulating successful build');
      // Simulate build delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true, demoUrl, isDemo: true };
    }

    return { success: false };
  }
}

export async function sendSMS(
  to: string,
  message: string,
  businessName: string
): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(N8N_SMS_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        message,
        businessName,
        type: 'sms',
        timestamp: new Date().toISOString(),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.error('SMS webhook failed:', error);
    // Demo mode: simulate success
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    }
    return false;
  }
}

export async function sendEmail(
  to: string,
  subject: string,
  body: string,
  businessName: string
): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(N8N_EMAIL_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject,
        message: body,
        businessName,
        type: 'email',
        timestamp: new Date().toISOString(),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.error('Email webhook failed:', error);
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    }
    return false;
  }
}

// n8n Workflow IDs (configure these in n8n)
const N8N_LOVABLE_DEPLOY_WORKFLOW_ID =
  import.meta.env.VITE_N8N_LOVABLE_DEPLOY_WORKFLOW_ID || '';

// Legacy webhook URLs (for fallback)
const N8N_DEPLOY_WEBHOOK_URL =
  import.meta.env.VITE_N8N_DEPLOY_WEBHOOK_URL || 'https://n8n.hudsond.me/webhook/deploy-and-invoice';
const N8N_LOVABLE_DEPLOY_WEBHOOK_URL =
  import.meta.env.VITE_N8N_LOVABLE_DEPLOY_WEBHOOK_URL || 'https://n8n.hudsond.me/webhook/deploy-website';

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

    const response = await fetch(N8N_DEPLOY_WEBHOOK_URL, {
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
 * Step 1: Generate Lovable Build URL using n8n REST API
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

    let response: Response;

    // Use REST API if workflow ID is configured (Worker handles API key)
    if (N8N_LOVABLE_DEPLOY_WORKFLOW_ID) {
      // Use n8n REST API to trigger workflow through Worker
      // Worker adds the N8N_API_KEY server-side
      response = await callN8nAPI(`/workflows/${N8N_LOVABLE_DEPLOY_WORKFLOW_ID}/execute`, 'POST', {
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
      });
    } else {
      // Fall back to webhook (through Worker for CORS)
      const webhookUrl = `${N8N_API_BASE_URL}/webhook/deploy-website`;
      response = await fetch(webhookUrl, {
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
    }

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
  const N8N_RENDER_DEPLOY_URL =
    import.meta.env.VITE_N8N_RENDER_DEPLOY_URL || 'https://n8n.hudsond.me/webhook/github-to-render';

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
 * Step 3 (NEW): Create GitHub repository and configure webhook
 * Part of automated deployment flow
 * Calls n8n webhook which creates repo via GitHub API and configures webhook
 */
export async function createGitHubRepoAndWebhook(
  businessName: string,
  packageTier: string
): Promise<GitHubCreateResponse> {
  const N8N_GITHUB_CREATE_URL =
    import.meta.env.VITE_N8N_GITHUB_CREATE_URL || 'https://n8n.hudsond.me/webhook/create-github-repo';

  // Generate repository name using existing slug pattern
  const repoName = `${businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')}-${packageTier.toLowerCase()}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seconds for GitHub API

    const response = await fetch(N8N_GITHUB_CREATE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        businessName,
        packageTier,
        timestamp: new Date().toISOString(),
      } as GitHubCreatePayload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Webhook returned ${response.status}`);
    }

    const data = await response.json();
    return {
      success: data.success,
      githubRepo: data.githubRepo,
      repoName: data.repoName,
      webhookUrl: data.webhookUrl,
    };
  } catch (error) {
    console.error('GitHub repo creation failed:', error);

    if (DEMO_MODE) {
      console.log('Demo mode: Simulating GitHub repo creation');
      await new Promise(resolve => setTimeout(resolve, 2000));
      return {
        success: true,
        githubRepo: `https://github.com/senpapi69/${repoName}`,
        repoName,
        webhookUrl: 'https://n8n.hudsond.me/webhook/github-render-deploy',
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create GitHub repository',
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
