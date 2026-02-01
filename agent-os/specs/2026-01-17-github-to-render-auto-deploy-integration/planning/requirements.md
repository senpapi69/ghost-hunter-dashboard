# Spec Requirements: GitHub to Render Auto-Deploy Integration

## Initial Description

Create an automated deployment system that connects GitHub repository creation/updates to Render deployments. When a user inputs a GitHub repository URL into the website automation assistant dashboard, the system should automatically:

1. Accept GitHub repository URL input from the user
2. Store the mapping between business/customer and their GitHub repository
3. Set up automated deployment to Render when the GitHub repo receives updates
4. Track deployment status and display it in the dashboard

**Context:**
- Current system: Lovable AI generates websites → user manually publishes to GitHub → user manually copies GitHub URL → user manually pastes into dashboard → triggers Render deploy
- Desired system: User inputs GitHub repo URL once → automatic Render deployment on any GitHub updates
- Tech stack: React + TypeScript frontend, n8n for webhooks/automation, Airtable for database, Render for hosting
- Existing n8n workflow available: `/github-to-render-auto-provision.json`

## Requirements Discussion

### User Goals

**Primary Objective:** Eliminate manual steps in the deployment workflow. The user wants the EASIEST possible experience for non-technical sales staff who are deploying websites for small business customers.

**Current Manual Workflow (7 steps):**
1. User clicks "Deploy" → calls `generateLovableBuildUrl()`
2. n8n generates Lovable build URL
3. Opens Lovable in new tab
4. User manually publishes to GitHub from Lovable UI
5. User manually copies GitHub URL
6. User manually pastes into dashboard
7. Calls `deployToRenderFromGitHub()` → n8n → Render API

**Desired Automated Workflow (3 visible steps to user):**
1. User clicks "Deploy"
2. System automatically generates website via Lovable
3. System automatically publishes to GitHub (CHALLENGE: no documented API)
4. GitHub webhook triggers n8n
5. n8n deploys to Render
6. Dashboard receives status update via webhook
7. Airtable updated automatically

### Technical Context Provided

**GitHub Account:**
- Personal account: `senpapi69`
- All business websites will be deployed under this account

**Render Configuration:**
- Owner ID: `tea-d57vla3e5dus73dkar5g`
- Service naming convention: `{business-name}-{package-tier}`
  - Example: "joes-pizza-starter"
- Auto-deploy enabled on all services
- Deploy on push to main branch

**Current Codebase Architecture:**
- Frontend: React + TypeScript, Vite bundler
- State Management: Zustand (`src/stores/appStore.ts`)
- Database: Airtable
  - Base ID: `appR5KcaSGMEwnZ6r`
  - Table ID: `tblnE3lsJkorUaAkL`
- Automation: n8n webhooks at `https://n8n.hudsond.me/webhook/*`
- Existing deploy component: `src/components/DeployInvoice.tsx`
- Webhook functions: `src/lib/webhook.ts`
- Existing n8n workflow: `/github-to-render-auto-provision.json`

### Database Schema Changes

**Airtable Business Table Updates:**

Add the following fields to the existing Business table (using camelCase as per current field naming):

1. **githubRepo** (text field)
   - Full GitHub repository URL
   - Example: `https://github.com/senpapi69/joes-pizza-starter`

2. **renderServiceId** (text field)
   - Render service ID returned from API
   - Example: `srv-abc123xyz`
   - Used to track and update deployments

3. **renderDeploymentUrl** (text field)
   - Live website URL on Render
   - Example: `https://joes-pizza-starter.onrender.com`

4. **deploymentStatus** (text field)
   - Values: `pending`, `deploying`, `live`, `failed`
   - Tracks current deployment state

### Deployment Triggers

**Fully Automatic Deployment:**
- Deploy on every push to main branch
- NO manual triggers required
- User should not need to think about deployment after initial setup
- Target users are non-technical sales staff

### Status Display Integration

**Integrate into existing `DeployInvoice.tsx` component workflow:**
- Current component already has multi-stage UI (lovable-ready → github-ready → render-deploying → complete)
- Add automatic status updates when webhook receives deployment notifications
- Display deployment progress in real-time
- Show deployment errors inline with retry option

### Error Handling Strategy

**Webhook Notification + Automatic Retry:**
- Send webhook notification to dashboard when error occurs
- Update Airtable automatically with error status
- Retry logic: 3 attempts with exponential backoff
  - Retry 1: Wait 30 seconds
  - Retry 2: Wait 60 seconds
  - Retry 3: Wait 120 seconds
- After 3 failed attempts: Stop and notify user
- Log all errors for debugging

### Webhook Security

**Basic Security (Current Phase):**
- Basic API key or secret token validation
- HTTPS only
- User confirmed this level is acceptable for current implementation
- Can enhance security in future iterations

### UI/UX Requirements

**Make it as EASY as possible:**
- Minimize number of clicks
- Simplify all messaging
- Use clear, non-technical language
- Provide visual progress indicators
- Auto-update status without refresh
- Show clear error messages with suggested actions

### Scope Boundaries

**In Scope:**
- One repository per business
- User confirmed this is acceptable and sufficient

**Repository Management:**
- Each business gets one GitHub repository
- Repository name follows pattern: `{business-name}-{package-tier}`
- All repos under account: `senpapi69`

### Existing Code Reuse

**Existing Features to Reference:**

1. **DeployInvoice Component** (`src/components/DeployInvoice.tsx`)
   - Multi-stage deployment UI (lovable-ready → github-ready → render-deploying → complete)
   - Progress indicators and status displays
   - Error handling and retry UI patterns
   - Integration with toast notifications

2. **Webhook Functions** (`src/lib/webhook.ts`)
   - `generateLovableBuildUrl()` - generates Lovable AI website
   - `deployToRenderFromGitHub()` - deploys to Render from GitHub URL
   - Error handling patterns with AbortController
   - Timeout management (90s for Lovable, 60s for Render)
   - Demo mode fallback logic

3. **n8n Workflow** (`github-to-render-auto-provision.json`)
   - GitHub webhook listener
   - Parse GitHub events (repository created, push events)
   - Conditional logic for triggering deploys
   - Render API integration
   - Response formatting

4. **Business Types** (`src/types/business.ts`)
   - Business interface structure
   - BuildJob interface for tracking builds
   - BuildStatus and PaymentStatus enums
   - Can extend these for deployment tracking

5. **App Store** (`src/stores/appStore.ts`)
   - Zustand state management patterns
   - Build job tracking methods
   - Stat incrementing for analytics
   - Celebration triggers for completed deploys

## Technical Challenges and Proposed Solutions

### Critical Challenge: Lovable to GitHub Publishing Automation

**Problem:**
Lovable documentation shows integrations FOR Lovable apps (connecting external services TO Lovable), but does NOT provide a documented programmatic API to control the "Publish to GitHub" action.

**Constraint:**
User wants QUICKEST method - fully automated, no new tab, no manual clicking.

**Potential Solutions to Research:**

1. **Undocumented Lovable API (HIGH PRIORITY)**
   - Research Lovable's internal API calls
   - Inspect network traffic when clicking "Publish to GitHub"
   - Attempt to replicate API calls programmatically
   - Risk: API may change without notice

2. **Lovable Webhook Integration**
   - Check if Lovable supports outbound webhooks
   - Trigger on "project published" event
   - Would notify our system when manual publish happens
   - Still requires one manual step but removes copy/paste

3. **Browser Automation (FALLBACK)**
   - Use Playwright or Puppeteer
   - Automate clicking "Publish to GitHub" button
   - Most reliable but adds complexity
   - Requires headless browser infrastructure

4. **Direct GitHub Push (ALTERNATIVE APPROACH)**
   - Get built code from Lovable programmatically
   - Use GitHub API to create repo and push code
   - Bypasses Lovable's GitHub integration entirely
   - Requires understanding Lovable's build output structure

5. **Streamlined Manual Process (MINIMAL VIABLE)**
   - Keep manual publish step
   - Auto-detect when GitHub repo is updated
   - Automatically deploy to Render from there
   - Reduces 7 steps to 3-4 steps

**Recommendation:**
Start with option 1 (research undocumented API) and option 2 (webhooks). If neither works, implement option 5 (streamlined manual) as MVP, with option 3 (browser automation) as future enhancement.

### Secondary Challenge: Real-time Status Updates

**Problem:**
Dashboard needs to show deployment status in real-time without constant polling.

**Solution:**
- Webhook from n8n to dashboard when deployment status changes
- Dashboard listens for webhook and updates Zustand store
- UI automatically re-renders with new status
- Store webhook endpoint in environment variable

### Third Challenge: Retry Logic Coordination

**Problem:**
Need to coordinate retry attempts between n8n, dashboard, and Airtable.

**Solution:**
- n8n workflow includes retry logic with exponential backoff
- Each retry attempt updates Airtable with attempt number
- Dashboard receives webhook on each attempt
- After 3 failures, n8n stops and sends final failure webhook
- Dashboard shows manual retry button

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
No visual files found in the visuals folder. The UI will extend the existing `DeployInvoice.tsx` component design patterns.

## Requirements Summary

### Functional Requirements

1. **Automated GitHub Repository Setup**
   - Create GitHub repository automatically (or accept manual creation)
   - Name repository following convention: `{business-name}-{package-tier}`
   - Use account: `senpapi69`
   - Store repository URL in Airtable

2. **Automated Render Service Creation**
   - Create Render web service when GitHub repo is ready
   - Use Render owner ID: `tea-d57vla3e5dus73dkar5g`
   - Configure auto-deploy on push to main branch
   - Name service: `{business-name}-{package-tier}`
   - Store service ID and deployment URL in Airtable

3. **Webhook-Driven Deployment**
   - GitHub webhook triggers on push to main
   - n8n receives webhook and initiates Render deployment
   - n8n sends status update webhook to dashboard
   - Dashboard updates UI automatically
   - Airtable updated with current status

4. **Deployment Status Tracking**
   - Track status: pending → deploying → live → failed
   - Store in Airtable `deploymentStatus` field
   - Display in `DeployInvoice` component
   - Update in real-time via webhooks

5. **Error Handling and Retry**
   - Automatic retry on failure: 3 attempts
   - Exponential backoff: 30s, 60s, 120s
   - Update Airtable with error details
   - Send webhook to dashboard with error
   - Show manual retry option after 3 failures

6. **User Actions Enabled**
   - Click "Deploy" button to start automated flow
   - View deployment progress in real-time
   - View live site URL when deployment complete
   - View GitHub repository link
   - Manually retry failed deployments
   - Mark payment as received

### Reusability Opportunities

**Components/Features That Might Be Reused:**
- `DeployInvoice.tsx` - extend with automated GitHub handling
- `webhook.ts` - add new webhook functions for GitHub automation
- `business.ts` types - extend Business interface with new fields
- `appStore.ts` - add deployment status tracking methods
- `github-to-render-auto-provision.json` - extend or replace with new workflow

**Backend Patterns to Follow:**
- Webhook timeout patterns (AbortController with 60-90s timeouts)
- Error handling with demo mode fallback
- Response formatting for consistency
- Toast notification patterns for user feedback

**Similar Features to Model After:**
- Existing Lovable URL generation flow
- Existing Render deployment flow
- Multi-stage deployment UI pattern
- Build job tracking system

### Scope Boundaries

**In Scope:**

1. Automated deployment pipeline from GitHub to Render
2. One repository per business
3. Airtable schema updates (4 new fields)
4. n8n workflow for GitHub webhook handling
5. Dashboard webhook receiver for status updates
6. UI updates in `DeployInvoice` component
7. Error handling with 3 retry attempts
8. Basic webhook security (API key/secret)
9. Real-time status display

**Out of Scope:**

1. Multiple repositories per business (one repo is sufficient)
2. Advanced security features (OAuth, signed webhooks) - basic is fine for now
3. Custom domain setup automation
4. SSL certificate automation (Render handles automatically)
5. Rollback functionality
6. A/B deployment or staging environments
7. Automated testing before deployment
8. Build artifact caching
9. Multi-region deployments

**Future Enhancements (Mentioned but Deferred):**

1. Browser automation for Lovable publishing (if API not found)
2. Enhanced webhook security
3. Deployment analytics dashboard
4. Automated rollback on errors
5. Custom domain configuration UI
6. Email notifications on deployment events

### Technical Considerations

**API Integrations:**

1. **Lovable AI API**
   - Current: `generateLovableBuildUrl()` generates build URL
   - Challenge: No documented API for "Publish to GitHub" action
   - Need: Research undocumented API or alternative approaches
   - Fallback: Streamline manual publish process

2. **GitHub API**
   - Create repositories programmatically
   - Set up webhooks for push events
   - Manage repository settings
   - Authentication: GitHub personal access token
   - Documentation: https://docs.github.com/en/rest

3. **Render API**
   - Current: `deployToRenderFromGitHub()` creates services
   - Endpoint: `https://api.render.com/v1/services`
   - Authentication: API key via HTTP header
   - Need: Store service ID for status checks
   - Documentation: https://api-docs.render.com/

4. **n8n Webhooks**
   - Current: Multiple webhooks already configured
   - Need: New webhook for GitHub events
   - Need: New webhook for status updates to dashboard
   - Base URL: `https://n8n.hudsond.me/webhook/*`
   - Response format: JSON with success/error status

**Integration Points:**

1. **Dashboard → n8n**
   - Deploy button triggers Lovable URL generation
   - Currently opens Lovable in new tab
   - Need: Automatic GitHub publish (research required)

2. **GitHub → n8n**
   - Webhook on push to main branch
   - n8n parses event and extracts repo info
   - n8n calls Render API to deploy

3. **n8n → Render**
   - Create service with auto-deploy enabled
   - Configure build settings
   - Get service ID and deployment URL

4. **n8n → Dashboard**
   - Send webhook with deployment status
   - Include: status, URLs, timestamps, errors
   - Dashboard updates Zustand store
   - UI re-renders automatically

5. **n8n → Airtable**
   - Update Business record with deployment data
   - Fields: githubRepo, renderServiceId, renderDeploymentUrl, deploymentStatus
   - Update on status changes
   - Update on errors

**Existing System Constraints:**

1. **Technology Stack**
   - Must use React + TypeScript (existing frontend)
   - Must use Airtable (existing database)
   - Must use n8n (existing automation platform)
   - Must use Render (existing hosting platform)

2. **Authentication & Accounts**
   - GitHub account: `senpapi69` (fixed)
   - Render owner ID: `tea-d57vla3e5dus73dkar5g` (fixed)
   - Cannot change these accounts

3. **Naming Conventions**
   - Repository name: `{business-name}-{package-tier}`
   - Service name: `{business-name}-{package-tier}`
   - Must follow existing slug generation logic

4. **User Skill Level**
   - Non-technical sales staff
   - Must minimize manual steps
   - Must use simple, clear language
   - Must provide obvious error recovery

**Technology Preferences:**

Based on codebase analysis:
- TypeScript for type safety
- Zustand for state management
- shadcn/ui for UI components
- Tailwind CSS for styling
- React hooks for component logic
- Fetch API for HTTP requests
- AbortController for request timeouts

## Success Criteria

### User Experience Metrics

1. **Reduced Manual Steps**
   - Current: 7 manual steps from deploy to live
   - Target: 3 or fewer manual steps
   - Measure: Count user actions from "Deploy" click to live site

2. **Reduced Time to Deploy**
   - Current: 5-8 minutes (includes manual copy/paste, waiting)
   - Target: 3-5 minutes (automated)
   - Measure: Timestamp from deploy trigger to site live

3. **Error Recovery**
   - Automatic retry succeeds 80%+ of the time
   - Manual retry option always available
   - Clear error messages with actionable steps

4. **Status Visibility**
   - User always knows current deployment status
   - No need to check multiple tabs or services
   - Updates appear within 5 seconds of status change

### Technical Success Criteria

1. **Webhook Reliability**
   - GitHub → n8n webhook fires 100% of pushes
   - n8n → Dashboard webhook delivers within 5 seconds
   - n8n → Airtable updates succeed 100%

2. **Deployment Success Rate**
   - 95%+ of deploys succeed on first attempt
   - 99%+ of deploys succeed within 3 retry attempts
   - All failures logged with clear error messages

3. **Data Consistency**
   - Airtable always reflects current deployment status
   - Dashboard UI always matches Airtable data
   - No orphaned services or repositories

4. **Performance**
   - Webhook endpoints respond within 200ms
   - UI updates appear within 5 seconds
   - No blocking operations in UI thread

### Business Metrics

1. **Sales Team Efficiency**
   - Non-technical staff can deploy without assistance
   - Fewer support requests related to deployment
   - Higher confidence in deployment process

2. **Customer Experience**
   - Faster time from sale to live website
   - Fewer errors visible to customers
   - More reliable deployment process

3. **Operational Costs**
   - No additional paid services required
   - Uses existing Render, GitHub, n8n infrastructure
   - Minimal ongoing maintenance

## Open Questions

### Critical Questions (Need Research)

1. **Lovable API for GitHub Publishing**
   - Does Lovable have an undocumented API for "Publish to GitHub"?
   - Can we intercept and replay the API calls?
   - Is there a webhook when publishing happens?
   - What's the most reliable automation approach?

2. **GitHub Webhook Configuration**
   - Should webhook be configured per-repo or organization-wide?
   - What events should trigger deployment? (push only, or also PR merges?)
   - How to handle webhook failures or missed events?

3. **Render Service Naming Conflicts**
   - What happens if service name already exists?
   - Should we append timestamp or counter?
   - How to handle business name changes?

### Implementation Questions

4. **Dashboard Webhook Endpoint**
   - Where should webhook endpoint live? (separate API route?)
   - Should it be protected by authentication?
   - How to handle concurrent webhooks?

5. **State Management**
   - Should deployment status be in Zustand store only?
   - Should we add local storage persistence?
   - How to handle stale data after page refresh?

6. **Error Categorization**
   - What errors should trigger automatic retry?
   - What errors should require manual intervention?
   - How to distinguish temporary vs permanent failures?

### User Experience Questions

7. **Progress Indicators**
   - Should we show estimated time remaining?
   - Should we show detailed build logs?
   - How much technical detail to show?

8. **Notification Preferences**
   - Should deployment completion trigger browser notification?
   - Should errors always show toast, or just update UI?
   - Should successful deploys trigger celebration animation?

9. **Manual Intervention**
   - Should user be able to cancel in-progress deployment?
   - Should user be able to trigger manual rebuild?
   - Should user see deployment history?

### Security Questions

10. **Webhook Authentication**
    - What level of security is sufficient for MVP?
    - API key in header or body?
    - Should we validate webhook signatures?

11. **GitHub Token Security**
    - Where to store GitHub personal access token?
    - Should it be in n8n environment or dashboard environment?
    - How to rotate tokens securely?

### Deployment Strategy Questions

12. **Rollout Plan**
    - Should we test with one business first?
    - Should we keep old manual flow as fallback?
    - How to migrate existing deployments?

13. **Monitoring and Logging**
    - What deployment metrics should we track?
    - Should we log all webhook payloads?
    - How long to retain deployment logs?

---

**Next Steps:**
1. Research Lovable API for GitHub publishing automation
2. Design GitHub webhook configuration approach
3. Design dashboard webhook receiver endpoint
4. Plan Airtable schema migration
5. Update n8n workflow for GitHub events
6. Extend DeployInvoice component for automated flow
