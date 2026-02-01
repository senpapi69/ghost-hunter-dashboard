# Specification: GitHub to Render Auto-Deploy Integration

## Goal
Eliminate manual deployment steps by automating the workflow from GitHub repository creation to Render deployment, reducing user actions from 7 steps to 3 or fewer while maintaining real-time status visibility for non-technical sales staff.

## User Stories
- As a non-technical sales staff member, I want to click a single "Deploy" button and have the system automatically generate a website and deploy it without manual copy/paste operations
- As a sales staff member, I want to see real-time deployment status updates without refreshing the page so I know exactly when my customer's website is live
- As a sales staff member, I want the system to automatically retry failed deployments so I don't need to troubleshoot technical errors

## Specific Requirements

**Automated GitHub Repository Management**
- Create GitHub repository programmatically using GitHub REST API under account `senpapi69`
- Follow naming convention: `{business-name}-{package-tier}` (e.g., "joes-pizza-starter")
- Store repository URL in Airtable field `githubRepo`
- Configure repository webhook to notify n8n on push events to main branch
- Use existing slug generation logic from `webhook.ts` for consistent naming
- Handle naming conflicts by appending timestamp if repository already exists
- Set repository as public for easy customer access
- Initialize with README containing deployment instructions

**Render Service Auto-Provisioning**
- Create Render web service via Render API using owner ID `tea-d57vla3e5dus73dkar5g`
- Configure service with auto-deploy enabled on push to main branch
- Use service name matching repository: `{business-name}-{package-tier}`
- Store Render service ID in Airtable field `renderServiceId` for status tracking
- Store deployment URL in Airtable field `renderDeploymentUrl`
- Set environment to Oregon region with Starter plan
- Configure as Docker web service for maximum compatibility
- Return service details to dashboard for real-time status display

**Webhook-Driven Deployment Pipeline**
- Configure GitHub webhook to n8n endpoint on push events
- Parse GitHub webhook payload in n8n to extract repository and branch information
- Trigger Render API call only for pushes to main branch
- Send deployment status webhook from n8n to dashboard endpoint
- Dashboard updates Zustand store automatically via webhook listener
- Airtable updates on each status change: pending → deploying → live/failed
- Implement exponential backoff retry logic: 30s, 60s, 120s
- Stop retry attempts after 3 failures and require manual intervention

**Lovable Integration Automation**
- Research undocumented Lovable API for programmatic "Publish to GitHub" action
- Inspect browser network traffic when clicking Lovable's publish button
- Attempt to replicate API call with proper authentication headers
- Fallback: Implement streamlined manual process with automatic GitHub URL detection
- Alternative: Use GitHub API directly to push Lovable build artifacts if accessible
- Document any discovered API endpoints for future reference
- Maintain existing `generateLovableBuildUrl()` function for initial site generation

**Dashboard Webhook Receiver**
- Create new webhook endpoint at `/api/webhooks/deployment-status` (or use Vite proxy)
- Validate webhook requests using shared secret API key from environment variables
- Parse deployment status from n8n webhook payload
- Update specific build job in Zustand store via `updateBuildJob()`
- Trigger toast notification for status changes
- Handle webhook failures gracefully without UI interruption
- Log all webhook payloads for debugging
- Return 200 OK response immediately to prevent webhook timeout

**Airtable Schema Updates**
- Add field `githubRepo` (single line text) to Business table
- Add field `renderServiceId` (single line text) to Business table
- Add field `renderDeploymentUrl` (single line text, URL format) to Business table
- Add field `deploymentStatus` (single select: pending, deploying, live, failed) to Business table
- Update fields via n8n workflow using existing Airtable integration patterns
- Fetch updated record data on status change to refresh dashboard
- Handle Airtable API rate limits with exponential backoff
- Store field mappings as constants in types file for reusability

**Deployment Status Tracking UI**
- Extend `DeployInvoice.tsx` component with new deployment stages
- Add stage: `github-creating` for repository creation progress
- Add stage: `render-provisioning` for service creation progress
- Add stage: `auto-deploying` for webhook-triggered deployment
- Display real-time progress with animated indicators
- Show deployment URLs immediately when available
- Update status automatically via webhook without page refresh
- Display error messages with actionable retry button
- Maintain existing visual design language with glow effects and cyber styling

**Error Handling and Recovery**
- Categorize errors as temporary (network, rate limits) or permanent (auth, config)
- Automatically retry temporary errors with exponential backoff
- Display permanent errors immediately with suggested actions
- Update Airtable with error details and timestamp
- Send webhook to dashboard with error payload
- Show manual retry button after 3 failed automatic attempts
- Log all errors with context (business name, repo, service ID)
- Track error metrics for monitoring

**Security Implementation**
- Store GitHub personal access token in n8n environment variables
- Store Render API key in n8n environment variables
- Store webhook secret key in both n8n and dashboard environment variables
- Validate webhook signature using shared secret in header
- Use HTTPS for all webhook endpoints
- Implement basic API key authentication for dashboard webhook
- Rotate tokens quarterly via environment variable updates
- Never expose credentials in frontend code or logs

**Real-Time Status Updates**
- Implement polling fallback (every 10 seconds) if webhook fails
- Use Server-Sent Events or WebSockets if available in Vite setup
- Update Zustand store atomically to prevent race conditions
- Trigger UI re-renders automatically on state change
- Show timestamp of last status update
- Display "Connecting..." indicator during webhook connection issues
- Cache status in localStorage for recovery after page refresh
- Clear cache when deployment completes to show fresh data

## Existing Code to Leverage

**DeployInvoice Component** (`src/components/DeployInvoice.tsx`)
- Multi-stage deployment UI pattern with visual progress indicators
- State management for deployment stages: lovable-ready → github-ready → render-deploying → complete
- Toast notification integration for user feedback
- Error handling UI with retry buttons
- Payment status tracking and celebration triggers
- Extend with additional stages for automated GitHub and Render provisioning

**Webhook Functions** (`src/lib/webhook.ts`)
- `generateLovableBuildUrl()` with 90-second timeout and AbortController pattern
- `deployToRenderFromGitHub()` with 60-second timeout
- Demo mode fallback for testing
- Slug generation logic: `lowercase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')`
- Error handling with try/catch and demo mode simulation
- Add new function `createGitHubRepo()` for repository creation
- Add new function `setupGitHubWebhook()` for webhook configuration

**Business Types** (`src/types/business.ts`)
- Business interface structure with existing fields
- BuildJob interface for tracking deployment jobs
- BuildStatus enum: extend with 'github-creating', 'render-provisioning', 'auto-deploying'
- PaymentStatus enum for payment tracking
- AirtableRecord interface for API response mapping
- Extend Business interface with githubRepo, renderServiceId, renderDeploymentUrl, deploymentStatus

**App Store** (`src/stores/appStore.ts`)
- Zustand state management with persist middleware
- Build job tracking via `addBuildJob()` and `updateBuildJob()`
- Stat incrementing for analytics via `incrementStat('sitesBuilt')`
- Celebration triggers via `triggerCelebration()`
- Add new action: `updateDeploymentStatus()` for webhook updates
- Add new action: `addDeploymentError()` for error tracking
- Persist deployment state across page refreshes

**n8n Workflow** (`github-to-render-auto-provision.json`)
- GitHub webhook listener node configuration
- JavaScript code node for parsing GitHub events
- Conditional logic for triggering deployment on push events
- Render API HTTP request node with authentication
- Response formatting with success/error status
- Extend to include Airtable update node
- Add webhook node to send status to dashboard
- Add retry logic with wait nodes between attempts

## Out of Scope
- Multiple repositories per business (one repository per business is sufficient)
- Staging or development environments (production only)
- Custom domain configuration automation (manual setup in Render dashboard)
- SSL certificate management (handled automatically by Render)
- Automated rollback functionality (manual redeploy via GitHub)
- A/B testing or canary deployments
- Pre-deployment automated testing
- Build artifact caching or optimization
- Multi-region deployment support
- Organization-level GitHub webhooks (per-repo webhooks only)
- OAuth or advanced webhook signature verification (basic API key validation)
- Email notifications on deployment events (in-app notifications only)
