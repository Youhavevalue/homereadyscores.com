import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch contacts from GoHighLevel
    const ghlRes = await fetch(
      `https://services.leadconnectorhq.com/contacts/?locationId=${GHL_LOCATION_ID}&limit=100`,
      {
        headers: {
          'Authorization': `Bearer ${GHL_API_KEY}`,
          'Version': '2021-07-28',
          'Accept': 'application/json',
        },
      }
    );

    if (!ghlRes.ok) {
      const errText = await ghlRes.text();
      console.error('GHL API error:', errText);
      return res.status(500).json({ error: 'Failed to fetch from GoHighLevel', details: errText });
    }

    const ghlData = await ghlRes.json();
    const contacts = ghlData.contacts || [];

    let synced = 0;
    let skipped = 0;

    for (const contact of contacts) {
      const clientData = {
        ghl_contact_id: contact.id,
        first_name: contact.firstName || contact.name?.split(' ')[0] || 'Unknown',
        last_name: contact.lastName || contact.name?.split(' ').slice(1).join(' ') || '',
        email: contact.email || null,
        phone: contact.phone || null,
        address: contact.address1 || null,
        city: contact.city || null,
        state: contact.state || null,
        zip: contact.postalCode || null,
        status: 'active',
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('clients')
        .upsert(clientData, {
          onConflict: 'ghl_contact_id',
          ignoreDuplicates: false,
        });

      if (error) {
        console.error('Upsert error for', contact.id, error);
        skipped++;
      } else {
        synced++;
      }
    }

    return res.status(200).json({
      success: true,
      synced,
      skipped,
      total: contacts.length,
    });
  } catch (err) {
    console.error('Sync error:', err);
    return res.status(500).json({ error: 'Sync failed', details: err.message });
  }
}
