import { Business, AirtableRecord } from '@/types/business';

const AIRTABLE_API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY;
const BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID || 'appR5KcaSGMEwnZ6r';
const TABLE_ID = 'tblnE3lsJkorUaAkL';

const AIRTABLE_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`;

export async function fetchBusinesses(): Promise<Business[]> {
  if (!AIRTABLE_API_KEY) {
    console.warn('Airtable API key not configured');
    return getMockBusinesses();
  }

  try {
    const response = await fetch(`${AIRTABLE_URL}?sort[0][field]=Rating&sort[0][direction]=desc`, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch businesses');
    }

    const data = await response.json();
    return data.records.map((record: AirtableRecord) => ({
      id: record.id,
      name: record.fields.Name || 'Unknown Business',
      phone: record.fields.Phone || '',
      address: record.fields.Address || '',
      rating: record.fields.Rating || 0,
      placeId: record.fields['Place ID'] || '',
      notes: record.fields.Notes || '',
      description: record.fields.Description || '',
      status: record.fields.Status as Business['status'],
    }));
  } catch (error) {
    console.error('Error fetching businesses:', error);
    return getMockBusinesses();
  }
}

export async function createBusiness(business: Omit<Business, 'id'>): Promise<Business | null> {
  if (!AIRTABLE_API_KEY) {
    console.warn('Airtable API key not configured');
    return null;
  }

  try {
    const response = await fetch(AIRTABLE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          Name: business.name,
          Phone: business.phone,
          Address: business.address,
          Rating: business.rating,
          'Place ID': business.placeId,
          Notes: business.notes,
          Description: business.description,
          Status: business.status,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create business');
    }

    const data = await response.json();
    return {
      id: data.id,
      name: data.fields.Name,
      phone: data.fields.Phone,
      address: data.fields.Address,
      rating: data.fields.Rating || 0,
      placeId: data.fields['Place ID'] || '',
      notes: data.fields.Notes || '',
      description: data.fields.Description || '',
      status: data.fields.Status as Business['status'],
    };
  } catch (error) {
    console.error('Error creating business:', error);
    return null;
  }
}

function getMockBusinesses(): Business[] {
  return [
    {
      id: '1',
      name: "Joe's Auto Repair",
      phone: '(555) 123-4567',
      address: '123 Main St, Springfield, IL 62701',
      rating: 5,
      placeId: 'mock-place-1',
      notes: 'They have been in business for 20 years with no online presence. Their competitors all have websites and are showing up in Google searches. Mention that 78% of customers research auto shops online before visiting.',
      description: 'Family-owned auto repair shop specializing in domestic vehicles.',
    },
    {
      id: '2',
      name: 'Bella Salon & Spa',
      phone: '(555) 234-5678',
      address: '456 Oak Ave, Springfield, IL 62702',
      rating: 5,
      placeId: 'mock-place-2',
      notes: 'They rely entirely on walk-ins and word of mouth. A website with online booking could increase their appointments by 40%. They have great reviews on Yelp but no way for customers to book directly.',
      description: 'Full-service hair salon and day spa with 15 years of experience.',
    },
    {
      id: '3',
      name: 'Downtown Deli',
      phone: '(555) 345-6789',
      address: '789 Elm St, Springfield, IL 62703',
      rating: 4,
      placeId: 'mock-place-3',
      notes: 'They are missing out on the lunch crowd that searches for "restaurants near me". A simple website with their menu and hours could drive significant foot traffic.',
      description: 'Classic deli serving sandwiches, soups, and catering services.',
    },
    {
      id: '4',
      name: 'Quick Print Shop',
      phone: '(555) 456-7890',
      address: '321 Pine Rd, Springfield, IL 62704',
      rating: 4,
      placeId: 'mock-place-4',
      notes: 'Their business services are invisible online. Companies searching for local print services cannot find them. A website with a quote request form would generate leads 24/7.',
      description: 'Commercial printing services for businesses and individuals.',
    },
    {
      id: '5',
      name: 'Sunset Plumbing',
      phone: '(555) 567-8901',
      address: '654 Maple Dr, Springfield, IL 62705',
      rating: 3,
      placeId: 'mock-place-5',
      notes: 'Emergency plumbing searches happen at all hours. Without a website, they are invisible to people with burst pipes at 2am. Competitors are capturing all the emergency calls.',
      description: '24/7 plumbing services for residential and commercial properties.',
    },
  ];
}
