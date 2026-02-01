# GitHub to Render Auto-Provision Setup Guide

This workflow automatically creates NEW Render web services whenever you create a new GitHub repository or make your first push to a repo.

## What This Workflow Does

1. **Listens** for GitHub webhook events (repository created or first push)
2. **Parses** the webhook payload to extract repository information
3. **Checks** if a new Render service should be created
4. **Creates** a new Render web service via Render API
5. **Returns** deployment status and service details

## Prerequisites

Before setting up this workflow, you need:

1. **Render Account** with API access
2. **Render API Key** from your account settings
3. **Render Owner ID** (your account/team ID)
4. **GitHub Repository** with webhook access
5. **n8n Instance** (you have: https://n8n.hudsond.me)

---

## Step 1: Get Your Render API Credentials

### Get Render API Key:
1. Go to https://dashboard.render.com/account/api-keys
2. Click "Create API Key"
3. Name it "n8n Automation" or similar
4. **Copy and save the API key** (you won't see it again!)

### Get Render Owner ID:
1. Go to https://dashboard.render.com/
2. Open your browser's Developer Tools (F12)
3. Go to Console tab
4. Paste this code and press Enter:
   ```javascript
   fetch('/api/v1/owners').then(r => r.json()).then(d => console.log(d[0].owner.id))
   ```
5. **Copy the Owner ID** that appears (format: `tea-xxxxx` or `usr-xxxxx`)

---

## Step 2: Import Workflow to n8n

1. Open n8n: https://n8n.hudsond.me
2. Click **"Add workflow" → "Import from file"**
3. Select: `github-to-render-auto-provision.json`
4. The workflow will appear with 6 nodes

---

## Step 3: Configure n8n Credentials

### Create Render API Key Credential:

1. In n8n, click **"Credentials"** in the left sidebar
2. Click **"Add Credential"**
3. Search for **"HTTP Header Auth"**
4. Configure:
   - **Name**: `Render API Key`
   - **Header Name**: `Authorization`
   - **Header Value**: `Bearer YOUR_RENDER_API_KEY_HERE`
   - Replace `YOUR_RENDER_API_KEY_HERE` with your actual API key from Step 1
5. Click **"Save"**

---

## Step 4: Update Workflow Configuration

### Update the "Create Render Service" Node:

1. Click on the **"Create Render Service"** node
2. In the **JSON Body** field, find:
   ```json
   "ownerId": "YOUR_RENDER_OWNER_ID"
   ```
3. Replace `YOUR_RENDER_OWNER_ID` with your Owner ID from Step 1
4. **Select the credential**: Click "Credential for Authentication" dropdown
5. Choose **"Render API Key"** (the credential you just created)

### Optional: Customize Service Settings

In the same JSON body, you can customize:

```json
{
  "serviceDetails": {
    "env": "docker",           // Options: "docker", "node", "python", "go", "ruby"
    "region": "oregon",        // Options: "oregon", "frankfurt", "singapore", "ohio"
    "plan": "starter"          // Options: "free", "starter", "standard", "pro"
  }
}
```

---

## Step 5: Get the Webhook URL

1. Click on the **"GitHub Webhook"** node
2. You'll see two URLs:
   - **Test URL**: For testing (only active when listening)
   - **Production URL**: For GitHub
3. **Copy the Production URL**:
   ```
   https://n8n.hudsond.me/webhook/github-render-provision
   ```

---

## Step 6: Configure GitHub Organization/User Webhook

You can set this up at two levels:

### Option A: Organization-Level Webhook (Recommended)
This will trigger for ALL repositories in your organization:

1. Go to your GitHub organization: `https://github.com/organizations/YOUR_ORG/settings/hooks`
2. Click **"Add webhook"**
3. Configure:
   - **Payload URL**: `https://n8n.hudsond.me/webhook/github-render-provision`
   - **Content type**: `application/json`
   - **Which events?**: Select "Let me select individual events"
     - ✅ **Repositories** (for new repo creation)
     - ✅ **Pushes** (for first push detection)
   - ✅ **Active**: Check this box
4. Click **"Add webhook"**

### Option B: Individual Repository Webhook
For a single repository:

1. Go to repository: `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/hooks`
2. Follow the same steps as Option A above

---

## Step 7: Activate the Workflow

1. In n8n, click the **"Activate"** toggle in the top-right corner
2. The workflow is now live and listening for events!

---

## Testing the Workflow

### Test 1: Create a New Repository

1. Create a new GitHub repository in your organization/account
2. Check n8n executions (Executions tab)
3. You should see:
   - Webhook received
   - Service creation triggered
   - Render service created

### Test 2: First Push to New Repo

1. Create a local repository:
   ```bash
   mkdir test-auto-deploy
   cd test-auto-deploy
   git init
   echo "# Test" > README.md
   git add .
   git commit -m "Initial commit"
   ```

2. Create a new GitHub repo (without initializing)

3. Push to GitHub:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/test-auto-deploy.git
   git push -u origin main
   ```

4. Check n8n and Render dashboard for the new service!

---

## How It Works

### Workflow Flow:

```
GitHub Event (new repo/first push)
       ↓
GitHub Webhook (receives event)
       ↓
Parse GitHub Event (extracts repo data)
       ↓
Should Create Service? (checks if new repo or first push)
       ↓                          ↓
     YES                         NO
       ↓                          ↓
Create Render Service    Skip Event (no action)
       ↓
Format Success Response
       ↓
Return service details
```

### Supported GitHub Events:

1. **Repository Created**: `repository.created`
   - Triggers when a new repository is created

2. **First Push**: `push` with `created: true`
   - Triggers on the first push to a new repository

---

## What Gets Created on Render

When triggered, the workflow creates a Render web service with:

- **Name**: Same as the GitHub repository name
- **Repository**: Linked to your GitHub repo
- **Branch**: Default branch (usually `main`)
- **Auto-Deploy**: Enabled (deploys automatically on push)
- **Environment**: Docker (customize in workflow)
- **Region**: Oregon (customize in workflow)
- **Plan**: Starter (customize in workflow)

---

## Customizing the Workflow

### Change Service Type

In "Create Render Service" node, change `"type"`:
- `"web_service"` - Web application (default)
- `"static_site"` - Static website
- `"private_service"` - Private backend service
- `"cron_job"` - Scheduled job

### Add Environment Variables

Add to the JSON body:
```json
{
  "envVars": [
    {
      "key": "NODE_ENV",
      "value": "production"
    },
    {
      "key": "API_KEY",
      "value": "your-secret-key"
    }
  ]
}
```

### Filter by Repository Name

Add a condition in "Should Create Service?" node:
```javascript
$json.repoName.startsWith('deploy-') && $json.shouldCreateService
```

This only creates services for repos starting with "deploy-"

---

## Troubleshooting

### Issue: Webhook not triggering
- Check GitHub webhook delivery in repo settings
- Verify webhook URL is correct
- Ensure workflow is activated in n8n

### Issue: API Error 401 (Unauthorized)
- Verify Render API key is correct
- Check the credential format: `Bearer YOUR_KEY`
- API key must not have expired

### Issue: API Error 400 (Bad Request)
- Check Owner ID is correct
- Verify JSON body format
- Review Render API documentation

### Issue: Service created but won't deploy
- Check repository has valid deployment files (Dockerfile, package.json, etc.)
- Verify branch name is correct
- Check Render service logs in dashboard

---

## Monitoring

### View Execution History:
1. In n8n, go to **"Executions"** tab
2. Filter by workflow name
3. Click any execution to see detailed logs

### Check Render Services:
1. Go to https://dashboard.render.com/
2. All auto-created services will appear here
3. Click a service to see deployment logs

---

## Security Best Practices

1. **Protect your API keys**: Never commit them to Git
2. **Use environment variables**: Store credentials securely in n8n
3. **Limit webhook IPs**: Restrict to GitHub's IP ranges if possible
4. **Monitor usage**: Check Render billing for unexpected services
5. **Set up notifications**: Get alerted when services are created

---

## Next Steps

- [ ] Import workflow to n8n
- [ ] Add Render API credentials
- [ ] Update Owner ID in workflow
- [ ] Get webhook URL
- [ ] Configure GitHub webhook
- [ ] Activate workflow
- [ ] Test with new repository
- [ ] Monitor first deployment

---

## Support

- **n8n Documentation**: https://docs.n8n.io
- **Render API Docs**: https://api-docs.render.com
- **GitHub Webhooks**: https://docs.github.com/webhooks

---

## Workflow Files

- Workflow JSON: `github-to-render-auto-provision.json`
- This guide: `RENDER-AUTO-PROVISION-SETUP.md`

Import the workflow and follow this guide to get automatic Render deployments working!
