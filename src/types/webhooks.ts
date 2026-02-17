/**
 * Webhook payload and response types for GitHub to Render auto-deploy integration
 */

export interface GitHubCreatePayload {
  businessName: string;
  packageTier: string;
  timestamp: string;
}

export interface GitHubCreateResponse {
  success: boolean;
  githubRepo?: string;
  repoName?: string;
  webhookUrl?: string;
  error?: string;
}

export interface DeploymentStatusWebhook {
  businessId: string;
  status: 'live' | 'failed' | 'deploying';
  renderUrl?: string;
  error?: string;
  timestamp: string;
}

export interface RenderDeployPayload {
  repo_url: string;
  name: string;
}

// n8n webhook response format for render-deploy
export interface N8nRenderServiceResponse {
  success: boolean;
  service_id: string;
  service_name: string;
  service_type: string;
  service_url: string;
  dashboard_url: string;
  deploy_id: string | null;
  deploy_status: string | null;
  message: string;
}

export interface RenderDeployResponse {
  success: boolean;
  jobId?: string;
  error?: string;
}

export interface RenderStatusResponse {
  jobId: string;
  status: 'queued' | 'building' | 'live' | 'failed';
  deployedUrl?: string;
  error?: string;
  progress?: string;
  logs?: string;
}
