import { Business, AirtableRecord, BusinessStatus } from '@/types/business';

const AIRTABLE_API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY;
const BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID || 'appR5KcaSGMEwnZ6r';
const TABLE_ID = 'tblnE3lsJkorUaAkL';

const AIRTABLE_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`;

export async function fetchBusinesses(): Promise<Business[]> {
  if (!AIRTABLE_API_KEY) {
    console.warn('Airtable API key not configured, using mock data');
    return getMockBusinesses();
  }

  try {
    const response = await fetch(
      `${AIRTABLE_URL}?sort[0][field]=Rating&sort[0][direction]=desc`,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch businesses');
    }

    const data = await response.json();
    const businesses = data.records.map((record: AirtableRecord) => ({
      id: record.id,
      name: record.fields.Name || 'Unknown Business',
      phone: record.fields.Phone || '',
      email: record.fields.Email || '',
      address: record.fields.Address || '',
      rating: record.fields.Rating || 0,
      placeId: record.fields['Place ID'] || '',
      notes: record.fields.Notes || '',
      description: record.fields.Description || '',
      status: (record.fields.Status as BusinessStatus) || 'New Lead',
      package: record.fields.Package,
      amount: record.fields.Amount,
      paid: record.fields.Paid || false,
      amountPaid: record.fields['Amount Paid'],
      stripePaymentId: record.fields['Stripe Payment ID'],
      paymentLink: record.fields['Payment Link'],
    }));

    // Prioritize businesses with phone and address
    return businesses.sort((a, b) => {
      const aHasComplete = a.phone && a.address;
      const bHasComplete = b.phone && b.address;

      // Both have complete info or both don't - sort by rating
      if (aHasComplete === bHasComplete) {
        return b.rating - a.rating;
      }

      // Prioritize complete info
      return aHasComplete ? -1 : 1;
    });
  } catch (error) {
    console.error('Error fetching businesses:', error);
    return getMockBusinesses();
  }
}

export async function createBusiness(
  business: Omit<Business, 'id'>
): Promise<Business | null> {
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
          Email: business.email,
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
      email: data.fields.Email || '',
      address: data.fields.Address,
      rating: data.fields.Rating || 0,
      placeId: data.fields['Place ID'] || '',
      notes: data.fields.Notes || '',
      description: data.fields.Description || '',
      status: (data.fields.Status as BusinessStatus) || 'New Lead',
      paid: false,
    };
  } catch (error) {
    console.error('Error creating business:', error);
    return null;
  }
}

export async function updateBusinessStatus(
  id: string,
  status: BusinessStatus
): Promise<boolean> {
  if (!AIRTABLE_API_KEY) {
    console.warn('Airtable API key not configured');
    return false;
  }

  try {
    const response = await fetch(`${AIRTABLE_URL}/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: { Status: status },
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error updating business status:', error);
    return false;
  }
}

function getMockBusinesses(): Business[] {
  return [
    {
      id: '1',
      name: "Joe's Auto Repair",
      phone: '(555) 123-4567',
      email: 'joe@autoshop.com',
      address: '123 Main St, Brisbane QLD 4000',
      rating: 5,
      placeId: 'ChIJ1234567890',
      notes:
        'They have been in business for 20 years with no online presence. Their competitors all have websites and are showing up in Google searches. Mention that 78% of customers research auto shops online before visiting. Owner is Joe, very friendly.',
      description: 'Family-owned auto repair shop specializing in domestic vehicles.',
      status: 'New Lead',
      paid: false,
    },
    {
      id: '2',
      name: 'Bella Salon & Spa',
      phone: '(555) 234-5678',
      email: 'sarah@bellaspa.com',
      address: '456 Oak Ave, Brisbane QLD 4001',
      rating: 5,
      placeId: 'ChIJ0987654321',
      notes:
        'They rely entirely on walk-ins and word of mouth. A website with online booking could increase their appointments by 40%. They have great reviews on Yelp but no way for customers to book directly. Ask for Sarah.',
      description: 'Full-service hair salon and day spa with 15 years of experience.',
      status: 'Called',
      paid: false,
    },
    {
      id: '3',
      name: 'Downtown Deli',
      phone: '(555) 345-6789',
      email: 'info@downtowndeli.com',
      address: '789 Elm St, Brisbane QLD 4002',
      rating: 4,
      placeId: 'ChIJ1122334455',
      notes:
        'They are missing out on the lunch crowd that searches for "restaurants near me". A simple website with their menu and hours could drive significant foot traffic. Very busy during lunch.',
      description: 'Classic deli serving sandwiches, soups, and catering services.',
      status: 'New Lead',
      paid: false,
    },
    {
      id: '4',
      name: 'Quick Print Shop',
      phone: '(555) 456-7890',
      email: 'orders@quickprint.com',
      address: '321 Pine Rd, Brisbane QLD 4003',
      rating: 4,
      placeId: 'ChIJ5566778899',
      notes:
        'Their business services are invisible online. Companies searching for local print services cannot find them. A website with a quote request form would generate leads 24/7.',
      description: 'Commercial printing services for businesses and individuals.',
      status: 'Invoice Sent',
      package: 'Business',
      amount: 999,
      paid: false,
      paymentLink: 'https://pay.stripe.com/demo/123',
    },
    {
      id: '5',
      name: 'Sunset Plumbing',
      phone: '(555) 567-8901',
      email: 'contact@sunsetplumbing.com',
      address: '654 Maple Dr, Brisbane QLD 4004',
      rating: 3,
      placeId: 'ChIJ9900112233',
      notes:
        'Emergency plumbing searches happen at all hours. Without a website, they are invisible to people with burst pipes at 2am. Competitors are capturing all the emergency calls.',
      description: '24/7 plumbing services for residential and commercial properties.',
      status: 'New Lead',
      paid: false,
    },
    {
      id: '6',
      name: 'Green Thumb Landscaping',
      phone: '(555) 678-9012',
      email: 'mike@greenthumb.com',
      address: '987 Garden Way, Brisbane QLD 4005',
      rating: 5,
      placeId: 'ChIJ4455667788',
      notes:
        'Seasonal business that could book out months in advance with proper online presence. Before/after gallery would be killer. Mention portfolio websites of competitors.',
      description: 'Professional landscaping and garden maintenance services.',
      status: 'Paid',
      package: 'Premium',
      amount: 1999,
      paid: true,
      amountPaid: 1999,
    },
    {
      id: '7',
      name: 'Elite Fitness Studio',
      phone: '(555) 789-0123',
      email: 'hello@elitefitness.com',
      address: '111 Gym Rd, Brisbane QLD 4006',
      rating: 5,
      placeId: 'ChIJ6677889900',
      notes:
        'Personal trainers with no online booking. Losing clients to competitors with slick websites. Membership signups could be automated.',
      description: 'Boutique fitness studio with personal training.',
      status: 'Built',
      package: 'Business',
      amount: 999,
      paid: true,
      amountPaid: 999,
    },
  ];
}
