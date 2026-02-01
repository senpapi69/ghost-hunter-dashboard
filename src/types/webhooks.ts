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
