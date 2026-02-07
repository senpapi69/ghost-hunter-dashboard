/**
 * Cloudflare Worker: n8n API Handler with CORS Proxy
 *
 * Architecture:
 * Dashboard → Cloudflare Worker (no API key) → n8n REST API (with API key)
 *
 * Environment Variables (set in Cloudflare dashboard):
 * - N8N_API_BASE_URL: Your n8n instance URL (e.g., https://n8n.hudsond.me)
 * - N8N_API_KEY: Your n8n API key
 * - ALLOWED_ORIGINS: Comma-separated list of allowed origins (optional)
 */

interface Env {
  N8N_API_BASE_URL: string;
  N8N_API_KEY: string;
  ALLOWED_ORIGINS?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return handleCORS(request);
    }

    try {
      const url = new URL(request.url);
      const path = url.pathname;

      // Health check endpoint
      if (path === '/health' || path === '/') {
        return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() });
      }

      // Proxy n8n REST API requests
      if (path.startsWith('/api/v1/')) {
        return proxyToN8nAPI(request, env);
      }

      // Proxy webhook requests to n8n
      if (path.startsWith('/webhook/')) {
        return proxyToN8nWebhook(request, env);
      }

      return jsonResponse({ error: 'Not found' }, 404);
    } catch (error) {
      console.error('Worker error:', error);
      return jsonResponse(
        { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
        500
      );
    }
  },
};

/**
 * Proxy requests to n8n REST API
 * Adds the N8N_API_KEY from environment variables
 */
async function proxyToN8nAPI(request: Request, env: Env): Promise<Response> {
  const n8nBaseUrl = env.N8N_API_BASE_URL.replace(/\/$/, '');
  const url = new URL(request.url);
  const n8nUrl = `${n8nBaseUrl}${url.pathname}${url.search}`;

  // Clone the request and modify headers
  const headers = new Headers(request.headers);
  headers.set('X-N8N-API-KEY', env.N8N_API_KEY);

  // Forward the request to n8n
  const n8nResponse = await fetch(n8nUrl, {
    method: request.method,
    headers,
    body: request.body,
  });

  // Create CORS-enabled response
  const corsHeaders = getCORSHeaders(request, env.ALLOWED_ORIGINS);

  return new Response(n8nResponse.body, {
    status: n8nResponse.status,
    statusText: n8nResponse.statusText,
    headers: {
      ...corsHeaders,
      'Content-Type': n8nResponse.headers.get('Content-Type') || 'application/json',
    },
  });
}

/**
 * Proxy webhook requests to n8n
 * Webhooks typically don't require API key authentication
 */
async function proxyToN8nWebhook(request: Request, env: Env): Promise<Response> {
  const n8nBaseUrl = env.N8N_API_BASE_URL.replace(/\/$/, '');
  const url = new URL(request.url);
  const n8nUrl = `${n8nBaseUrl}${url.pathname}${url.search}`;

  // Forward the request to n8n
  const n8nResponse = await fetch(n8nUrl, {
    method: request.method,
    headers: {
      'Content-Type': request.headers.get('Content-Type') || 'application/json',
    },
    body: request.body,
  });

  const corsHeaders = getCORSHeaders(request, env.ALLOWED_ORIGINS);

  return new Response(n8nResponse.body, {
    status: n8nResponse.status,
    statusText: n8nResponse.statusText,
    headers: {
      ...corsHeaders,
      'Content-Type': n8nResponse.headers.get('Content-Type') || 'application/json',
    },
  });
}

/**
 * Handle CORS preflight requests
 */
function handleCORS(request: Request): Response {
  const corsHeaders = getCORSHeaders(request);
  return new Response(null, { headers: corsHeaders });
}

/**
 * Get CORS headers based on request origin
 */
function getCORSHeaders(request: Request, allowedOrigins?: string): Headers {
  const headers = new Headers();
  const origin = request.headers.get('Origin') || '*';

  // Check if origin is allowed (if restrictions are set)
  let allowedOrigin = '*';
  if (allowedOrigins) {
    const origins = allowedOrigins.split(',').map(o => o.trim());
    if (origins.includes(origin)) {
      allowedOrigin = origin;
    } else if (origins[0] !== '*') {
      allowedOrigin = origins[0]; // Fallback to first allowed origin
    }
  }

  headers.set('Access-Control-Allow-Origin', allowedOrigin);
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-N8N-API-KEY');
  headers.set('Access-Control-Max-Age', '86400');
  headers.set('Access-Control-Allow-Credentials', 'true');

  return headers;
}

/**
 * Create a JSON response with CORS headers
 */
function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
