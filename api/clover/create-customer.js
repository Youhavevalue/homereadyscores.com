// POST /api/clover/create-customer
// Creates a Clover customer with card-on-file (COF)
// Body: { email, firstName, lastName, source (clv_ token) }

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, firstName, lastName, source } = req.body;

  if (!email || !source) {
    return res.status(400).json({ error: 'email and source (card token) are required' });
  }

  const accessToken = process.env.CLOVER_ACCESS_TOKEN;
  if (!accessToken) {
    return res.status(500).json({ error: 'Clover access token not configured' });
  }

  // Sandbox: scl-sandbox.dev.clover.com | Production: scl.clover.com
  const baseUrl = 'https://scl-sandbox.dev.clover.com';

  try {
    const response = await fetch(`${baseUrl}/v1/customers`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        source,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Clover create-customer error:', data);
      return res.status(response.status).json({
        error: data.message || 'Failed to create Clover customer',
        details: data,
      });
    }

    // Return the customer ID and source info
    return res.status(200).json({
      customerId: data.id,
      email: data.email,
      sources: data.sources,
      created: data.created,
    });
  } catch (err) {
    console.error('Clover create-customer exception:', err);
    return res.status(500).json({ error: 'Internal server error: ' + err.message });
  }
}
