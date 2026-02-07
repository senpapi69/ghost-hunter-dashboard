# n8n CORS Handler - Cloudflare Worker

This Cloudflare Worker acts as a secure proxy between your dashboard and n8n instance.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────┐
│   Dashboard     │────▶│ Cloudflare Worker│────▶│     n8n     │
│  (Browser/Client)    │  (CORS Proxy)    │  API Key│   (REST API)│
└─────────────────┘     └──────────────────┘     └─────────────┘
```

**Key Security Feature**: The n8n API key is stored in the Worker's environment variables, NOT in the dashboard code. The Worker adds the API key when forwarding requests to n8n.

## Setup

### 1. Get your n8n API Key

1. Go to your n8n instance
2. Settings → API → Create API Key
3. Copy the API key (you won't see it again!)

### 2. Deploy the Worker

```bash
cd cloudflare-worker
npm install
```

### 3. Configure Environment Variables

Set secrets (these are encrypted and never exposed):

```bash
# Set your n8n API key
npm run secret:put
# Paste your API key when prompted

# Set your n8n base URL
npm run secret:put:url
# Enter: https://n8n.hudsond.me (or your n8n URL)
```

Or using wrangler directly:

```bash
npx wrangler secret put N8N_API_KEY
npx wrangler secret put N8N_API_BASE_URL
```

### 4. Deploy

```bash
npm run deploy
```

### 5. Update Dashboard Environment Variables

Update your dashboard `.env` file:

```bash
# The Worker URL (no API key needed on client!)
VITE_N8N_API_BASE_URL=https://n8n-cors-handler.bigbbghud.workers.dev

# Your n8n workflow IDs (for REST API calls)
VITE_N8N_LOVABLE_DEPLOY_WORKFLOW_ID=your-workflow-id
```

## Worker Endpoints

| Path | Description | Auth |
|------|-------------|------|
| `/health` | Health check | None |
| `/api/v1/*` | Proxy to n8n REST API | Worker adds API key |
| `/webhook/*` | Proxy to n8n webhooks | None |

## Development

Run the worker locally:

```bash
npm run dev
```

View real-time logs:

```bash
npm run tail
```

## Security

- API key stored in Cloudflare Workers (encrypted at rest)
- Never exposed to client-side code
- CORS headers configurable via `ALLOWED_ORIGINS`
- Request forwarding preserves HTTP method and body
