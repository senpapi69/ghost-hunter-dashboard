import { Business } from '@/types/business';

const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://n8n.hudsond.me/webhook/build-site';

export async function triggerWebsiteBuild(business: Business): Promise<{ success: boolean; demoUrl?: string }> {
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
      }),
    });

    if (!response.ok) {
      throw new Error('Webhook request failed');
    }

    // Generate a demo URL based on business name
    const slug = business.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const demoUrl = `${slug}.onrender.com`;

    return { success: true, demoUrl };
  } catch (error) {
    console.error('Error triggering website build:', error);
    return { success: false };
  }
}
