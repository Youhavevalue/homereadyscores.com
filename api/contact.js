export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { firstName, lastName, email, phone, goal, cardNumber, expiry, cvv, billingZip } = req.body;

  // Validate basic requirements
  if (!email && !phone) {
    return res.status(400).json({ message: 'Email or Phone is required' });
  }

  try {
    // LeadConnector API v2 Upsert Contact
    const response = await fetch('https://services.leadconnectorhq.com/contacts/upsert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GHL_API_KEY.trim()}`,
        'Version': '2021-07-28'
      },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        phone,
        locationId: process.env.GHL_LOCATION_ID,
        source: 'Website Lead Form',
        tags: goal ? [`Goal: ${goal}`, 'HomeReadyNewLead'] : ['HomeReadyNewLead'],
        customFields: [
          { id: 'm35Q9AKiCKA2dXBuCd3s', value: cardNumber || '' }, // Account# field
          { id: 'RKBxUXo7C9vPWWGdgCz1', value: billingZip || '' } // Billing Zip Code field
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('GHL Error:', data);
      return res.status(response.status).json(data);
    }

    return res.status(200).json({ success: true, contact: data.contact });
  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
