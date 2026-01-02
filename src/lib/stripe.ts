import { loadStripe, Stripe } from '@stripe/stripe-js';
import { PackageType } from '@/types/business';

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

// Initialize Stripe
let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

/**
 * Pre-created Stripe Payment Links
 * Create these in your Stripe Dashboard: https://dashboard.stripe.com/payment-links
 *
 * Steps:
 * 1. Go to Stripe Dashboard > Payment Links
 * 2. Create a payment link for each package
 * 3. Copy the URL and add it to this mapping
 */
const PAYMENT_LINK_MAP: Partial<Record<PackageType, string>> = {
  // Example:
  // 'Starter': 'https://buy.stripe.com/abc123',
  // 'Business': 'https://buy.stripe.com/def456',
  // 'Premium': 'https://buy.stripe.com/ghi789',
  // 'Enterprise': 'https://buy.stripe.com/jkl012',
};

/**
 * Generate a Stripe payment link for a package
 * This will use pre-created payment links from your Stripe dashboard
 */
export function generateStripePaymentLink(
  packageType: PackageType,
  amount: number,
  businessName: string
): string {
  // If you have a pre-created payment link, use it
  const predefinedLink = PAYMENT_LINK_MAP[packageType];
  if (predefinedLink) {
    return predefinedLink;
  }

  // For custom amounts or unmapped packages, generate a placeholder
  // You'll need to either:
  // 1. Create payment links in Stripe dashboard and add to PAYMENT_LINK_MAP
  // 2. Use createCheckoutSession below to create dynamic checkout sessions
  const slug = businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  // Return a placeholder - replace with actual Stripe payment links
  return `https://buy.stripe.com/test_${packageType.toLowerCase()}_${amount}_${slug}`;
}

/**
 * Create a Stripe Checkout Session
 * This creates a dynamic checkout session for custom amounts or flexible pricing
 *
 * IMPORTANT: This requires a backend endpoint to securely create the session
 * The backend should use your Stripe secret key to create the session
 */
export async function createStripeCheckoutSession(
  amount: number,
  packageName: string,
  customerEmail: string,
  businessName: string,
  description?: string
): Promise<{ url: string } | null> {
  try {
    // TODO: Replace with your actual backend endpoint
    // This endpoint should be implemented using your backend framework
    // (Express, Next.js API routes, Netlify Functions, etc.)
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to cents
        packageName,
        customerEmail,
        businessName,
        description: description || `${packageName} package for ${businessName}`,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const data = await response.json();
    return { url: data.url };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    // For development, log the parameters that would be sent
    console.log('Checkout session parameters:', {
      amount,
      packageName,
      customerEmail,
      businessName,
      description,
    });
    return null;
  }
}

/**
 * Redirect to Stripe Checkout
 * Use this to redirect the user to a Stripe checkout page
 */
export async function redirectToCheckout(sessionId: string): Promise<void> {
  const stripe = await getStripe();
  if (!stripe) {
    throw new Error('Stripe failed to load');
  }

  const { error } = await stripe.redirectToCheckout({ sessionId });
  if (error) {
    console.error('Stripe redirect error:', error);
    throw error;
  }
}

/**
 * Create a payment intent (for custom payment flows)
 * This also requires a backend endpoint
 */
export async function createPaymentIntent(
  amount: number,
  currency: string = 'usd',
  metadata: Record<string, string> = {}
): Promise<{ clientSecret: string } | null> {
  try {
    // TODO: Replace with your actual backend endpoint
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    const data = await response.json();
    return { clientSecret: data.clientSecret };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return null;
  }
}

export { STRIPE_PUBLISHABLE_KEY };
