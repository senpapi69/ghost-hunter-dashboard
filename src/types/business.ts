export interface Business {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  rating: number;
  placeId: string;
  notes: string;
  description: string;
  status: BusinessStatus;
  package?: PackageType;
  amount?: number;
  paid: boolean;
  amountPaid?: number;
  stripePaymentId?: string;
  paymentLink?: string;
  paidAt?: Date;
}

export type BusinessStatus = 'New Lead' | 'Called' | 'Invoice Sent' | 'Paid' | 'Built';

export type PackageType = 'Starter' | 'Business' | 'Premium' | 'Enterprise' | 'Custom';

export interface Package {
  id: PackageType;
  name: string;
  price: number;
  description: string;
  icon: string;
}

export const PACKAGES: Package[] = [
  { id: 'Starter', name: 'Starter', price: 499, description: 'Single page', icon: '⚡' },
  { id: 'Business', name: 'Business', price: 999, description: '5 pages + SEO', icon: '🚀' },
  { id: 'Premium', name: 'Premium', price: 1999, description: 'Full site + blog', icon: '💎' },
  { id: 'Enterprise', name: 'Enterprise', price: 4999, description: 'Custom build', icon: '🏢' },
];

export interface AirtableRecord {
  id: string;
  fields: {
    Name?: string;
    Phone?: string;
    Email?: string;
    Address?: string;
    Rating?: number;
    'Place ID'?: string;
    Notes?: string;
    Description?: string;
    Status?: string;
    Package?: string;
    Amount?: number;
    Paid?: boolean;
    'Amount Paid'?: number;
    'Stripe Payment ID'?: string;
    'Payment Link'?: string;
    'Paid At'?: string;
  };
}

export type BuildStatus = 'queued' | 'building' | 'live' | 'error';
export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface BuildJob {
  id: string;
  businessId: string;
  businessName: string;
  package: PackageType;
  amount: number;
  status: BuildStatus;
  paymentStatus: PaymentStatus;
  triggeredAt: Date;
  previewUrl?: string;
  stripePaymentId?: string;
  errorMessage?: string;
}

export type CallOutcome = 'Answered' | 'No Answer' | 'Callback' | 'Not Interested' | 'Interested';

export interface CallLog {
  id: string;
  businessId: string;
  businessName: string;
  outcome: CallOutcome;
  notes: string;
  followUpDate?: Date;
  loggedAt: Date;
}

export interface DailyStats {
  leadsToday: number;
  callsMade: number;
  conversions: number;
  sitesBuilt: number;
  revenueToday: number;
  pendingInvoices: number;
  pendingInvoicesTotal: number;
}

export interface RevenueStats {
  totalRevenue: number;
  thisMonth: number;
  lastMonth: number;
  thisWeek: number;
  today: number;
}

export interface Transaction {
  id: string;
  businessId: string;
  businessName: string;
  package: PackageType;
  amount: number;
  paymentStatus: PaymentStatus;
  date: Date;
  stripePaymentId?: string;
}
