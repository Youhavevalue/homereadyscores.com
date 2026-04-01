import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { clientId } = req.body;

    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required' });
    }

    // Get client data from Supabase
    const { data: client, error: fetchError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (fetchError || !client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Skip if already synced
    if (client.ghl_contact_id) {
      return res.status(200).json({
        success: true,
        contactId: client.ghl_contact_id,
        message: 'Already synced',
      });
    }

    // Push to GHL via REST API
    const ghlRes = await fetch('https://services.leadconnectorhq.com/contacts/upsert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GHL_API_KEY}`,
        'Version': '2021-07-28',
      },
      body: JSON.stringify({
        locationId: process.env.GHL_LOCATION_ID,
        firstName: client.first_name,
        lastName: client.last_name,
        email: client.email || undefined,
        phone: client.phone || undefined,
        address1: client.address || undefined,
        city: client.city || undefined,
        state: client.state || undefined,
        postalCode: client.zip || undefined,
        source: 'Home Ready Scores Portal',
        tags: ['portal-client', 'credit-repair'],
      }),
    });

    const ghlData = await ghlRes.json();

    if (!ghlRes.ok) {
      console.error('GHL push error:', ghlData);
      return res.status(500).json({ error: 'Failed to sync to GHL', details: ghlData });
    }

    const contactId = ghlData.contact?.id;

    // Save GHL contact ID back to Supabase
    if (contactId) {
      await supabase
        .from('clients')
        .update({ ghl_contact_id: contactId })
        .eq('id', clientId);
    }

    return res.status(200).json({
      success: true,
      contactId,
      new: ghlData.new,
    });
  } catch (err) {
    console.error('GHL push error:', err);
    return res.status(500).json({ error: err.message });
  }
}
