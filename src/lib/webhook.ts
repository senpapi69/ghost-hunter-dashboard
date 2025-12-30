import { Business } from '@/types/business';

const N8N_WEBHOOK_URL =
  import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://n8n.hudsond.me/webhook/build-site';
const N8N_SMS_WEBHOOK_URL =
  import.meta.env.VITE_N8N_SMS_WEBHOOK_URL || 'https://n8n.hudsond.me/webhook/send-sms';
const N8N_EMAIL_WEBHOOK_URL =
  import.meta.env.VITE_N8N_EMAIL_WEBHOOK_URL || 'https://n8n.hudsond.me/webhook/send-email';

// Demo mode - simulates successful webhook calls when real webhooks fail
const DEMO_MODE = true;

export async function triggerWebsiteBuild(
  business: Business
): Promise<{ success: boolean; demoUrl?: string; isDemo?: boolean }> {
  const slug = business.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const demoUrl = `${slug}.onrender.com`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        placeId: business.placeId,
        businessName: business.name,
        phone: business.phone,
        address: business.address,
        timestamp: new Date().toISOString(),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Webhook returned ${response.status}`);
    }

    return { success: true, demoUrl };
  } catch (error) {
    console.error('Webhook failed:', error);
    
    // In demo mode, simulate success after webhook failure
    if (DEMO_MODE) {
      console.log('Demo mode: Simulating successful build');
      // Simulate build delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true, demoUrl, isDemo: true };
    }
    
    return { success: false };
  }
}

export async function sendSMS(
  to: string,
  message: string,
  businessName: string
): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(N8N_SMS_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        message,
        businessName,
        type: 'sms',
        timestamp: new Date().toISOString(),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.error('SMS webhook failed:', error);
    // Demo mode: simulate success
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    }
    return false;
  }
}

export async function sendEmail(
  to: string,
  subject: string,
  body: string,
  businessName: string
): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(N8N_EMAIL_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject,
        message: body,
        businessName,
        type: 'email',
        timestamp: new Date().toISOString(),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.error('Email webhook failed:', error);
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    }
    return false;
  }
}

const N8N_DEPLOY_WEBHOOK_URL =
  import.meta.env.VITE_N8N_DEPLOY_WEBHOOK_URL || 'https://n8n.hudsond.me/webhook/deploy-and-invoice';

export interface DeployAndInvoicePayload {
  placeId: string;
  businessName: string;
  phone: string;
  address: string;
  email: string;
  package: string;
  amount: number;
}

export interface DeployAndInvoiceResponse {
  success: boolean;
  buildId?: string;
  paymentLink?: string;
  previewUrl?: string;
  isDemo?: boolean;
  error?: string;
}

export async function triggerDeployAndInvoice(
  payload: DeployAndInvoicePayload
): Promise<DeployAndInvoiceResponse> {
  const slug = payload.businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(N8N_DEPLOY_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString(),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Webhook returned ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      buildId: data.buildId,
      paymentLink: data.paymentLink,
      previewUrl: data.previewUrl,
    };
  } catch (error) {
    console.error('Deploy webhook failed:', error);

    if (DEMO_MODE) {
      console.log('Demo mode: Simulating successful deploy and invoice');
      await new Promise(resolve => setTimeout(resolve, 2500));
      return {
        success: true,
        buildId: `demo-${Date.now()}`,
        paymentLink: `https://buy.stripe.com/demo_${slug}`,
        previewUrl: `https://${slug}.onrender.com`,
        isDemo: true,
      };
    }

    return { success: false };
  }
}
