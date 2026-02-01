/**
 * Server-side deployment status webhook handler
 * Task Group 5: Webhook Receiver Endpoint (Production Server)
 *
 * This file should be placed on the production server at:
 * /api/webhooks/deployment-status.js
 *
 * It receives webhook requests from n8n and forwards them to the dashboard
 * For production deployment on Render or similar hosting platforms
 */

import { parseDeploymentStatusRequest } from '../../src/api/webhooks/deployment-status';

export async function POST(request) {
  try {
    // Parse the webhook request
    const result = await parseDeploymentStatusRequest(request);

    if (!result.success) {
      return new Response(
        JSON.stringify({ success: false, message: result.message }),
        { status: result.message === 'Unauthorized' ? 401 : 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Return immediate 200 OK to prevent webhook timeout
    return new Response(
      JSON.stringify({ success: true, message: 'Status received' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error handling deployment status webhook:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// For Next.js App Router
export const runtime = 'edge';

// For Express.js
/*
import express from 'express';
import cors from 'cors';
import { parseDeploymentStatusRequest } from './src/api/webhooks/deployment-status';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/webhooks/deployment-status', async (req, res) => {
  try {
    const result = await parseDeploymentStatusRequest(req);

    if (!result.success) {
      return res.status(result.message === 'Unauthorized' ? 401 : 400).json({
        success: false,
        message: result.message
      });
    }

    return res.status(200).json({ success: true, message: 'Status received' });
  } catch (error) {
    console.error('Error handling deployment status webhook:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.listen(3000, () => {
  console.log('Webhook server running on port 3000');
});
*/
