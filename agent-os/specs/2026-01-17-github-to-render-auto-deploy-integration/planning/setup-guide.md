# GitHub to Render Auto-Deploy: Setup Guide

## Overview
This guide will help you set up the GitHub to Render Auto-Deploy integration for the Ghost Hunter Dashboard.

## Prerequisites
- Access to GitHub account `senpapi69`
- Access to Render account with owner ID `tea-d57vla3e5dus73dkar5g`
- Access to n8n instance at `https://n8n.hudsond.me`
- Access to Airtable base `appR5KcaSGMEwnZ6r`

---

## Step 1: Airtable Schema Setup

### Add New Fields to Business Table

1. Open Airtable base `appR5KcaSGMEwnZ6r`
2. Go to table `tblnE3lsJkorUaAkL` (Business table)
3. Add the following fields:

#### Field 1: GitHub Repo
- **Type**: Single line text
- **Name**: `GitHub Repo`
- **Description**: Full GitHub repository URL
- **Example**: `https://github.com/senpapi69/joes-pizza-starter`

#### Field 2: Render Service ID
- **Type**: Single line text
- **Name**: `Render Service ID`
- **Description**: Render service ID for status tracking
- **Example**: `srv-abc123xyz`

#### Field 3: Render Deployment URL
- **Type**: Single line text (URL format)
- **Name**: `Render Deployment URL`
- **Description**: Live website URL on Render
- **Example**: `https://joes-pizza-starter.onrender.com`

#### Field 4: Deployment Status
- **Type**: Single select
- **Name**: `Deployment Status`
- **Options**: `pending`, `deploying`, `live`, `failed`
- **Default**: `pending`
- **Description**: Current deployment state

---

## Step 2: Generate Secure Keys

### Generate Webhook Secret Key

Run this command to generate a secure webhook secret:

```bash
openssl rand -base64 32
```

Example output:
```
K7xY9mP3qR8vT2wN5jL4hG6fD1sA9zC0bV3nM7pQ2xR4tY8uW5iO6
```

**Save this value securely** - you'll need it for both n8n and dashboard configuration.

---

## Step 3: Configure n8n Environment Variables

### 3.1 Add GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with these scopes:
   - `repo` (Full control of private repositories)
   - `admin:repo_hook` (Full control of repository hooks)
3. Copy the token
4. In n8n, add environment variable:
   - **Name**: `GITHUB_TOKEN`
   - **Value**: Your GitHub personal access token

### 3.2 Add Render API Key

1. Log in to Render dashboard
2. Go to Account Settings → API Keys
3. Create new API key with service management scope
4. Copy the API key
5. In n8n, add environment variable:
   - **Name**: `RENDER_API_KEY`
   - **Value**: Your Render API key

### 3.3 Add Webhook Secret Key

In n8n, add environment variable:
- **Name**: `WEBHOOK_SECRET_KEY`
- **Value**: The webhook secret you generated in Step 2

---

## Step 4: Import n8n Workflows

### 4.1 Import "Create GitHub Repository" Workflow

1. Open n8n dashboard
2. Click "Import from File"
3. Select file: `n8n-workflows/create-github-repo.json`
4. Configure HTTP Header Auth credentials:
   - **Header Name**: `Authorization`
   - **Header Value**: `token {{ $env.GITHUB_TOKEN }}`
5. Activate the workflow
6. Note the webhook URL: `https://n8n.hudsond.me/webhook/create-github-repo`

### 4.2 Import "GitHub to Render Auto-Deploy" Workflow

1. Open n8n dashboard
2. Click "Import from File"
3. Select file: `n8n-workflows/github-render-auto-deploy.json`
4. Configure HTTP Header Auth credentials:
   - **Header Name**: `Authorization`
   - **Header Value**: `Bearer {{ $env.RENDER_API_KEY }}`
5. Update the "Send Dashboard Webhook" node:
   - Replace `https://YOUR-DOMAIN.com/api/webhooks/deployment-status` with your actual dashboard domain
   - Replace `YOUR_WEBHOOK_SECRET` with your webhook secret from Step 2
6. Activate the workflow
7. Note the webhook URL: `https://n8n.hudsond.me/webhook/github-render-deploy`

---

## Step 5: Configure Dashboard Environment Variables

### 5.1 Update `.env` File

Add or update these environment variables in your dashboard `.env` file:

```bash
# Webhook Secret Key (must match n8n WEBHOOK_SECRET_KEY)
VITE_WEBHOOK_SECRET_KEY=your-webhook-secret-here

# n8n Webhook URLs
VITE_N8N_WEBHOOK_URL=https://n8n.hudsond.me/webhook/build-site
VITE_N8N_SMS_WEBHOOK_URL=https://n8n.hudsond.me/webhook/send-sms
VITE_N8N_EMAIL_WEBHOOK_URL=https://n8n.hudsond.me/webhook/send-email
VITE_N8N_DEPLOY_WEBHOOK_URL=https://n8n.hudsond.me/webhook/deploy-and-invoice
VITE_N8N_LOVABLE_DEPLOY_WEBHOOK_URL=https://n8n.hudsond.me/webhook/deploy-website
VITE_N8N_RENDER_DEPLOY_URL=https://n8n.hudsond.me/webhook/github-to-render

# New webhooks for auto-deploy integration
VITE_N8N_GITHUB_CREATE_URL=https://n8n.hudsond.me/webhook/create-github-repo
```

### 5.2 Update `.env.example` File

Update the `.env.example` file with the new variables (already done in this implementation).

---

## Step 6: Deploy Dashboard to Production Server

### 6.1 Build the Dashboard

```bash
npm run build
```

### 6.2 Deploy to Server

**Option A: Render (Recommended)**
1. Create new web service on Render
2. Connect to your GitHub repository
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variables from Step 5
6. Deploy

**Option B: Vercel/Netlify**
1. Connect repository to Vercel/Netlify
2. Add environment variables
3. Deploy

### 6.3 Update Webhook URL in n8n

After deployment, update the "Send Dashboard Webhook" node in the GitHub to Render workflow:
- Replace `https://YOUR-DOMAIN.com/api/webhooks/deployment-status`
- With your actual production domain: `https://your-dashboard-domain.com/api/webhooks/deployment-status`

---

## Step 7: Configure GitHub Repository Webhook (Manual Setup)

If you need to manually configure a GitHub webhook for an existing repository:

1. Go to repository settings on GitHub
2. Click "Webhooks" → "Add webhook"
3. Configure:
   - **Payload URL**: `https://n8n.hudsond.me/webhook/github-render-deploy`
   - **Content type**: `application/json`
   - **Secret**: (leave empty - n8n uses X-Webhook-Secret header)
   - **Events**: Select "Just the push event"
   - **Active**: Checked
4. Click "Add webhook"

---

## Step 8: Test the Integration

### Test 1: GitHub Repository Creation

1. Open the dashboard in your browser
2. Select a business and choose "Automated Deploy"
3. Click "Deploy"
4. Verify:
   - GitHub repository is created under `senpapi69` account
   - Repository has webhook configured
   - Repository URL appears in dashboard

### Test 2: Render Deployment

1. After GitHub repo is created, publish to GitHub from Lovable
2. Wait for webhook to trigger
3. Verify:
   - Render service is created
   - Auto-deploy is enabled
   - Dashboard receives status updates
   - Deployment URL appears when live

### Test 3: Webhook Authentication

```bash
# Test with valid secret
curl -X POST https://your-dashboard.com/api/webhooks/deployment-status \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: your-webhook-secret" \
  -d '{"businessId":"test","status":"live","timestamp":"2026-01-17T00:00:00Z"}'

# Expected: 200 OK

# Test with invalid secret
curl -X POST https://your-dashboard.com/api/webhooks/deployment-status \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: invalid-secret" \
  -d '{"businessId":"test","status":"live","timestamp":"2026-01-17T00:00:00Z"}'

# Expected: 401 Unauthorized
```

---

## Step 9: Verify Airtable Integration

1. After successful deployment, check Airtable
2. Verify business record has:
   - `GitHub Repo` field populated
   - `Render Service ID` field populated
   - `Render Deployment URL` field populated
   - `Deployment Status` set to `live`

---

## Step 10: Monitor and Troubleshoot

### Check n8n Execution Logs

1. Open n8n dashboard
2. Click on workflow
3. View "Executions" tab
4. Check for errors or failed executions

### Check GitHub Webhook Deliveries

1. Go to repository settings on GitHub
2. Click "Webhooks"
3. Click on webhook URL
4. View recent deliveries

### Check Render Service Logs

1. Go to Render dashboard
2. Click on service
3. View "Logs" tab
4. Check for build or deployment errors

### Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| GitHub repo creation fails | Check `GITHUB_TOKEN` has `repo` and `admin:repo_hook` scopes |
| Render service creation fails | Check `RENDER_API_KEY` has service management scope |
| Dashboard not receiving webhooks | Verify `WEBHOOK_SECRET_KEY` matches in both n8n and dashboard |
| Deployment not triggering | Check GitHub webhook is configured for push events |
| Naming conflicts | System automatically appends timestamp, check n8n logs |

---

## Security Best Practices

1. **Rotate credentials quarterly**
   - Generate new GitHub personal access token
   - Generate new Render API key
   - Generate new webhook secret
   - Update environment variables

2. **Never commit secrets to git**
   - All secrets in environment variables
   - `.env` file in `.gitignore`
   - Use `.env.example` for documentation

3. **Use HTTPS only**
   - All webhook URLs use HTTPS
   - Dashboard deployed with SSL certificate

4. **Monitor webhook failures**
   - Set up alerts for failed webhook deliveries
   - Check n8n execution logs regularly

---

## Support and Maintenance

### Daily Operations
- Monitor deployment success rate
- Check for webhook delivery failures
- Review Airtable data consistency

### Weekly Tasks
- Review n8n workflow executions
- Check GitHub repository naming conflicts
- Verify Render service status

### Monthly Tasks
- Review and rotate credentials if needed
- Update documentation
- Audit security settings

---

## Additional Resources

- **GitHub API Documentation**: https://docs.github.com/en/rest
- **Render API Documentation**: https://api-docs.render.com/
- **n8n Documentation**: https://docs.n8n.io/
- **Airtable API Documentation**: https://airtable.com/developers/web/api

---

## Next Steps

After setup is complete:
1. Train sales staff on new automated deployment flow
2. Monitor first 5-10 deployments closely
3. Gather feedback and iterate on process
4. Document any customizations for your team

---

**Last Updated**: 2026-01-17
**Version**: 1.0
**Maintained By**: Ghost Hunter Dashboard Team
