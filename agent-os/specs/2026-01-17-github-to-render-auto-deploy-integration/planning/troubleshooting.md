# Troubleshooting Guide
## GitHub to Render Auto-Deploy Integration

---

## Quick Diagnostics

### Check System Status

Before troubleshooting, verify all systems are operational:

1. **n8n Workflows**
   - Login to n8n: https://n8n.hudsond.me
   - Check workflows are active (green status)
   - Look for recent failed executions

2. **GitHub Account**
   - Login to GitHub: https://github.com/senpapi69
   - Check rate limits: Settings → Developer settings → Rate limit
   - Verify personal access token is valid

3. **Render Account**
   - Login to Render dashboard
   - Check for active services
   - Verify API key hasn't expired

4. **Airtable Base**
   - Open base: appR5KcaSGMEwnZ6r
   - Check Business table is accessible
   - Verify new fields exist

---

## Common Issues and Solutions

### Category 1: GitHub Repository Creation

#### Issue: "Failed to create GitHub repository"

**Symptoms:**
- Error message: "Failed to create GitHub repository"
- Deployment stuck at "Creating GitHub Repository"
- n8n workflow execution fails

**Possible Causes:**
1. GitHub personal access token expired
2. Insufficient token permissions
3. GitHub rate limit exceeded
4. Repository name already exists (even with timestamp)
5. Network connectivity issues

**Solutions:**

**Solution 1: Check GitHub Token**
```bash
# Test token validity
curl -H "Authorization: token YOUR_GITHUB_TOKEN" \
  https://api.github.com/user

# Expected: User profile JSON
# If 401 Unauthorized: Token is expired or invalid
```

To fix:
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token with `repo` and `admin:repo_hook` scopes
3. Update n8n environment variable `GITHUB_TOKEN`
4. Reactivate n8n workflow

**Solution 2: Check GitHub Rate Limit**
```bash
# Check rate limit status
curl -H "Authorization: token YOUR_GITHUB_TOKEN" \
  https://api.github.com/rate_limit

# Look at "remaining" count
# If low: Wait until reset (shown in "reset" timestamp)
```

To fix:
1. Wait for rate limit to reset (typically 1 hour)
2. Or reduce deployment frequency
3. Or use multiple GitHub accounts (advanced)

**Solution 3: Manual Repository Creation**
As a workaround:
1. Create repository manually on GitHub
2. Use "Manual Deploy" option in dashboard
3. Paste GitHub URL when prompted

---

#### Issue: "Repository already exists"

**Symptoms:**
- n8n workflow shows naming conflict
- No automatic timestamp append
- Error in workflow execution

**Solution:**
1. Check if repo actually exists: https://github.com/senpapi69/{repo-name}
2. If exists:
   - Delete if not needed
   - Or use manual deploy with existing repo
   - Or rename to avoid conflict
3. If doesn't exist:
   - GitHub API cache issue
   - Wait 5-10 minutes and retry
   - Or manually create the repo

---

### Category 2: Render Service Creation

#### Issue: "Failed to create Render service"

**Symptoms:**
- Error message: "Failed to deploy to Render"
- Deployment stuck at "Provisioning Render Service"
- No service appears in Render dashboard

**Possible Causes:**
1. Render API key expired or invalid
2. Owner ID is incorrect
3. Service name already exists
4. Render account suspended or billing issue
5. Invalid GitHub repository URL

**Solutions:**

**Solution 1: Verify Render API Key**
```bash
# Test API key
curl -H "Authorization: Bearer YOUR_RENDER_API_KEY" \
  https://api.render.com/v1/services

# Expected: JSON array of services
# If 401 Unauthorized: API key is invalid
```

To fix:
1. Login to Render dashboard
2. Go to Account Settings → API Keys
3. Generate new API key
4. Update n8n environment variable `RENDER_API_KEY`
5. Reactivate workflow

**Solution 2: Check Owner ID**
The correct owner ID is: `tea-d57vla3e5dus73dkar5g`

Verify in n8n workflow:
1. Open "Create Render Service" node
2. Check JSON body has: `"ownerId": "tea-d57vla3e5dus73dkar5g"`
3. If different, update and reactivate workflow

**Solution 3: Check Render Account Status**
1. Login to Render dashboard
2. Check for billing alerts or suspension notices
3. Verify payment method is valid
4. Check account is in good standing

---

#### Issue: "Deployment timeout on Render"

**Symptoms:**
- Deployment shows "deploying" for >10 minutes
- No status updates via webhook
- Render service shows "building" continuously

**Possible Causes:**
1. Build is taking longer than usual
2. Build failed but not reported
3. GitHub repository is empty
4. Dockerfile is missing or invalid
5. Webhook from n8n to dashboard failed

**Solutions:**

**Solution 1: Check Render Service Logs**
1. Open Render dashboard
2. Click on the service
3. Go to "Logs" tab
4. Look for build errors or warnings
5. Common issues:
   - Missing Dockerfile
   - Invalid package.json
   - Build script errors
   - Memory limit exceeded

**Solution 2: Manual Service Check**
```bash
# Check service status via API
curl -H "Authorization: Bearer YOUR_RENDER_API_KEY" \
  https://api.render.com/v1/services/{service-id}

# Look for "suspended" or "build_failed" in status
```

**Solution 3: Trigger Manual Deploy**
1. Go to Render dashboard
2. Click on the service
3. Click "Manual Deploy"
4. Select "Deploy latest commit"
5. Monitor logs in real-time

**Solution 4: Clear Render Cache**
1. Go to service settings in Render
2. Click "Clear build cache & deploy"
3. This forces a fresh build

---

### Category 3: Webhook and Status Updates

#### Issue: "Dashboard not receiving status updates"

**Symptoms:**
- Deployment completes but dashboard doesn't update
- Status stays stuck at "deploying"
- No toast notifications
- Airtable not updated

**Possible Causes:**
1. Webhook URL is incorrect
2. Webhook secret doesn't match
3. Dashboard domain changed
4. Firewall blocking webhook
5. Zustand store not updating

**Solutions:**

**Solution 1: Verify Webhook URL**
In n8n workflow "Send Dashboard Webhook" node:
- URL should be: `https://your-dashboard-domain.com/api/webhooks/deployment-status`
- Must use HTTPS (not HTTP)
- Must point to production server (not localhost)

**Solution 2: Check Webhook Secret**
Dashboard `.env`:
```bash
VITE_WEBHOOK_SECRET_KEY=your-secret-here
```

n8n workflow (in HTTP header):
```
X-Webhook-Secret: your-secret-here
```

Both must match exactly!

**Solution 3: Test Webhook Manually**
```bash
# Test webhook endpoint
curl -X POST https://your-dashboard.com/api/webhooks/deployment-status \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: your-webhook-secret" \
  -d '{
    "businessId": "test-business",
    "status": "live",
    "renderUrl": "https://test.onrender.com",
    "timestamp": "2026-01-17T00:00:00Z"
  }'

# Expected: {"success":true,"message":"Status received"}
# If 401: Webhook secret doesn't match
# If 404: Webhook endpoint doesn't exist
```

**Solution 4: Check Browser Console**
1. Open dashboard in browser
2. Open Developer Tools (F12)
3. Go to Console tab
4. Look for JavaScript errors
5. Common issues:
   - Zustand store mutation errors
   - Network request failures
   - Cross-origin issues

**Solution 5: Force Refresh Dashboard**
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Clear browser cache
3. Check localStorage for stale data
4. Logout and login again

---

### Category 4: Airtable Integration

#### Issue: "Airtable fields not updating"

**Symptoms:**
- Deployment completes successfully
- GitHub repo and Render service created
- But Airtable fields remain empty

**Possible Causes:**
1. Field names don't match
2. Airtable API rate limit
3. n8n Airtable node misconfigured
4. Business record not found
5. Insufficient Airtable permissions

**Solutions:**

**Solution 1: Verify Field Names**
Check Airtable Business table has these exact fields:
- `GitHub Repo` (Single line text)
- `Render Service ID` (Single line text)
- `Render Deployment URL` (Single line text)
- `Deployment Status` (Single select)

**Solution 2: Check Airtable API Rate Limit**
```bash
# Check rate limit
curl -H "Authorization: Bearer YOUR_AIRTABLE_TOKEN" \
  https://api.airtable.com/v0/meta/usage

# Look at remaining percentage
# If low: Wait for reset (typically monthly)
```

**Solution 3: Verify n8n Airtable Node**
1. Open n8n workflow
2. Find "Update Airtable Record" node
3. Check:
   - Base ID: `appR5KcaSGMEwnZ6r`
   - Table ID: `tblnE3lsJkorUaAkL`
   - Field mappings are correct
   - Match by business name or ID

**Solution 4: Manual Airtable Update**
As a workaround:
1. Open Airtable Business table
2. Find the business record
3. Manually fill in:
   - GitHub Repo URL
   - Render Service ID
   - Render Deployment URL
   - Deployment Status: `live`

---

### Category 5: User Interface Issues

#### Issue: "Deploy button doesn't work"

**Symptoms:**
- Click "Deploy" button and nothing happens
- No dialog appears
- No errors shown

**Solutions:**

**Solution 1: Check Business Selection**
- Must select a business first
- Click on business in list
- Business name should appear in button

**Solution 2: Check Browser Console**
1. Open Developer Tools (F12)
2. Go to Console tab
3. Click Deploy button
4. Look for red error messages
5. Common issues:
   - React component error
   - Missing dependencies
   - Props mismatch

**Solution 3: Clear Browser Cache**
1. Clear cache and cookies
2. Hard refresh: Ctrl+Shift+R
3. Try incognito/private mode
4. Try different browser

**Solution 4: Check Network Tab**
1. Open Developer Tools (F12)
2. Go to Network tab
3. Click Deploy button
4. Check if requests are made
5. Look for failed requests (red)

---

#### Issue: "Status not updating in real-time"

**Symptoms:**
- Have to refresh page to see updates
- Status indicators don't animate
- Toast notifications don't appear

**Solutions:**

**Solution 1: Check Zustand Store**
1. Open browser console
2. Type: `localStorage.getItem('ghost-hunter-storage-v2')`
3. Parse the JSON to see build jobs
4. Verify status is being persisted

**Solution 2: Check useEffect Hook**
The component should subscribe to build job updates:
```typescript
useEffect(() => {
  const job = buildJobs.find(j => j.businessId === business.id);
  // Updates UI based on job status
}, [buildJobs, business]);
```

**Solution 3: Verify Webhook Integration**
1. Check network tab for webhook requests
2. Verify webhook returns 200 OK
3. Check console for store updates
4. Look for "📥 Deployment Status Webhook received" message

---

## Advanced Troubleshooting

### Enable Debug Mode

**Dashboard:**
```javascript
// Add to browser console
localStorage.setItem('debug', 'true');
window.location.reload();
```

This enables:
- Detailed console logging
- Webhook payload logging
- Store mutation tracking
- Network request details

**n8n:**
1. Open workflow
2. Click on "Settings" gear icon
3. Enable "Workflow Execution Data"
4. Set "Error Workflow" to handle failures

### Check n8n Workflow Execution History

1. Open n8n dashboard
2. Click on workflow
3. Go to "Executions" tab
4. Click on recent execution
5. Step through each node:
   - Check input/output data
   - Look for error messages
   - Verify HTTP status codes
   - Check response times

### Monitor GitHub Repository

1. Go to repository on GitHub
2. Click "Settings" → "Webhooks"
3. Find webhook pointing to n8n
4. Click "Recent Deliveries"
5. Check:
   - Response codes (should be 200)
   - Response time
   - Redeliveries (indicates failure)

### Monitor Render Service

1. Open Render dashboard
2. Click on service
3. Check "Events" tab
4. Look for:
   - Build failures
   - Deployment timeouts
   - Service suspensions
   - Memory limit errors

---

## Emergency Procedures

### Full System Reset

If everything is broken and you need to start over:

1. **Pause all n8n workflows**
   - Deactivate workflows
   - Stop any running executions

2. **Check all credentials**
   - Verify GitHub token
   - Verify Render API key
   - Verify webhook secrets

3. **Clean up failed resources**
   - Delete orphaned GitHub repos
   - Delete failed Render services
   - Update Airtable records

4. **Reactivate workflows**
   - Update credentials if needed
   - Reactivate n8n workflows
   - Test with simple deployment

5. **Monitor first deployment**
   - Watch logs in real-time
   - Check webhook deliveries
   - Verify Airtable updates

### Rollback to Manual Process

If automated system is completely down:

1. Use "Manual Deploy" option in dashboard
2. Manual workflow:
   - Create GitHub repo manually
   - Build website in Lovable
   - Publish to GitHub from Lovable
   - Create Render service manually
   - Copy URLs to Airtable manually

This is slower but reliable as a fallback.

---

## Getting Additional Help

### When to Contact Technical Support

Contact support if:
- ✅ You've tried all solutions above
- ✅ Multiple deployments are failing
- ✅ Error messages don't make sense
- ✅ You suspect a system-wide issue
- ✅ You need emergency rollback

### Information to Provide

When contacting support, include:
1. Business name you're trying to deploy
2. Package selected
3. Exact error message (screenshot if possible)
4. Steps you've already tried
5. n8n execution ID (if applicable)
6. Timestamp of the failure

### Debug Information Package

Create a debug package:
```bash
# Collect n8n workflow executions
# Export workflow JSON
# Screenshot Airtable fields
# Copy browser console logs
# Note webhook URL and secret (don't share actual secret)
```

---

## Maintenance Tasks

### Weekly Maintenance

- [ ] Check n8n execution success rate
- [ ] Review GitHub repositories created
- [ ] Verify Render services are running
- [ ] Check Airtable for stale data

### Monthly Maintenance

- [ ] Rotate credentials (GitHub token, Render API key, webhook secret)
- [ ] Clean up orphaned resources
- [ ] Review and update documentation
- [ ] Test full deployment flow

### Quarterly Maintenance

- [ ] Security audit of all credentials
- [ ] Update n8n workflows if needed
- [ ] Review and optimize workflows
- [ ] Train team on any new processes

---

**Last Updated:** 2026-01-17
**Version:** 1.0
**Maintained By:** Ghost Hunter Dashboard Team
