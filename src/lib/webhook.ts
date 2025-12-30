import { Business } from '@/types/business';

const N8N_WEBHOOK_URL =
  import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://n8n.hudsond.me/webhook/build-site';
const N8N_SMS_WEBHOOK_URL =
  import.meta.env.VITE_N8N_SMS_WEBHOOK_URL || 'https://n8n.hudsond.me/webhook/send-sms';
const N8N_EMAIL_WEBHOOK_URL =
  import.meta.env.VITE_N8N_EMAIL_WEBHOOK_URL || 'https://n8n.hudsond.me/webhook/send-email';

export async function triggerWebsiteBuild(
  business: Business
): Promise<{ success: boolean; demoUrl?: string }> {
  try {
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
    });

    if (!response.ok) {
      throw new Error('Webhook request failed');
    }

    const slug = business.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const demoUrl = `${slug}.onrender.com`;

    return { success: true, demoUrl };
  } catch (error) {
    console.error('Error triggering website build:', error);
    return { success: false };
  }
}

export async function sendSMS(
  to: string,
  message: string,
  businessName: string
): Promise<boolean> {
  try {
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
    });

    return response.ok;
  } catch (error) {
    console.error('Error sending SMS:', error);
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
    });

    return response.ok;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}
