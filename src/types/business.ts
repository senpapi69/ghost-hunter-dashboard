export interface Business {
  id: string;
  name: string;
  phone: string;
  address: string;
  rating: number;
  placeId: string;
  notes: string;
  description: string;
  status: BusinessStatus;
}

export type BusinessStatus = 'New Lead' | 'Called' | 'Sold' | 'Built';

export interface AirtableRecord {
  id: string;
  fields: {
    Name?: string;
    Phone?: string;
    Address?: string;
    Rating?: number;
    'Place ID'?: string;
    Notes?: string;
    Description?: string;
    Status?: string;
  };
}

export type BuildStatus = 'queued' | 'building' | 'live' | 'error';

export interface BuildJob {
  id: string;
  businessId: string;
  businessName: string;
  status: BuildStatus;
  triggeredAt: Date;
  previewUrl?: string;
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
}
