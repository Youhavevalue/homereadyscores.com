import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { firstName, lastName, email, phone, goal, plan, cardNumber, expiry, cvv, billingZip } = req.body;

  // Validate basic requirements
  if (!email && !phone) {
    return res.status(400).json({ message: 'Email or Phone is required' });
  }

  try {
    // ──────────────────────────────────────────────
    // 1. Push lead to GoHighLevel CRM
    // ──────────────────────────────────────────────
    const apiKey = process.env.GHL_API_KEY || '';
    
    // Determine plan text for tags and custom fields
    const planText = plan === 'couple' ? 'Couple Enrollment' : (plan === 'single' ? 'Single Enrollment' : '');

    const tags = ['HomeReadyNewLead'];
    if (goal) tags.push(`Goal: ${goal}`);
    if (planText) tags.push(`Plan: ${planText}`);

    let ghlContactId = null;

    const ghlResponse = await fetch('https://services.leadconnectorhq.com/contacts/upsert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Version': '2021-07-28'
      },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        phone,
        locationId: process.env.GHL_LOCATION_ID,
        source: 'Website Lead Form',
        tags,
        customFields: [
          { 
            id: 'm35Q9AKiCKA2dXBuCd3s', 
            key: 'contact.account',
            field_value: cardNumber || '' 
          },
          { 
            id: 'RKBxUXo7C9vPWWGdgCz1', 
            key: 'contact.billing_zip_code',
            field_value: billingZip || '' 
          },
          {
            id: 'UXmy6qfFuKHyYbpOrCnm',
            key: 'contact.single_or_joint_account',
            field_value: planText
          }
        ]
      })
    });

    const ghlData = await ghlResponse.json();

    if (!ghlResponse.ok) {
      console.error('GHL Error:', ghlData);
      return res.status(ghlResponse.status).json(ghlData);
    }

    ghlContactId = ghlData.contact?.id || null;

    // ──────────────────────────────────────────────
    // 2. Create client record in Supabase portal
    // ──────────────────────────────────────────────
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    let clientId = existingClient?.id;

    if (!existingClient) {
      // Create new client in the portal
      const { data: newClient, error: insertError } = await supabase
        .from('clients')
        .insert({
          first_name: firstName,
          last_name: lastName,
          email: email || null,
          phone: phone || null,
          status: 'active',
          ghl_contact_id: ghlContactId,
        })
        .select('id')
        .single();

      if (insertError) {
        console.error('Supabase insert error:', insertError);
        // Don't fail the whole request — GHL already succeeded
      } else {
        clientId = newClient.id;
      }
    } else {
      // Update existing client with GHL ID if missing
      if (ghlContactId) {
        await supabase
          .from('clients')
          .update({ ghl_contact_id: ghlContactId })
          .eq('id', existingClient.id);
      }
    }

    // ──────────────────────────────────────────────
    // 3. Create intake form with enrollment info
    // ──────────────────────────────────────────────
    if (clientId) {
      const goals = [];
      if (goal) goals.push(goal);

      await supabase
        .from('intake_forms')
        .upsert({
          client_id: clientId,
          goals,
          notes: planText ? `Enrolled via website — ${planText}` : 'Enrolled via website',
        }, { onConflict: 'client_id' });
    }

    return res.status(200).json({ success: true, contact: ghlData.contact });
  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
