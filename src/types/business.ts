export interface Business {
  id: string;
  name: string;
  phone: string;
  address: string;
  rating: number;
  placeId: string;
  notes: string;
  description: string;
  status?: 'New Lead' | 'Called' | 'Sold' | 'Built';
}

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

export type BuildStatus = 'ready' | 'building' | 'complete' | 'error';
