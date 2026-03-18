// POST /api/clover/create-plan
// Creates a recurring billing plan in Clover
// Body: { name, amount (in cents), interval (MONTH/WEEK/DAY/YEAR), intervalCount, note }

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, amount, interval = 'MONTH', intervalCount = 1, note } = req.body;

  if (!name || !amount) {
    return res.status(400).json({ error: 'name and amount (in cents) are required' });
  }

  const validIntervals = ['DAY', 'WEEK', 'MONTH', 'YEAR'];
  if (!validIntervals.includes(interval)) {
    return res.status(400).json({ error: `interval must be one of: ${validIntervals.join(', ')}` });
  }

  const accessToken = process.env.CLOVER_ACCESS_TOKEN;
  const merchantId = process.env.CLOVER_MERCHANT_ID;
  if (!accessToken || !merchantId) {
    return res.status(500).json({ error: 'Clover credentials not configured' });
  }

  // Sandbox: apisandbox.dev.clover.com | Production: api.clover.com
  const baseUrl = 'https://apisandbox.dev.clover.com';

  try {
    const payload = {
      name,
      amount: Math.round(amount),
      interval,
      intervalCount,
    };
    if (note) payload.note = note;

    const response = await fetch(`${baseUrl}/recurring/v1/plans`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Clover-Merchant-Id': merchantId,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Clover create-plan error:', data);
      return res.status(response.status).json({
        error: data.message || 'Failed to create plan',
        details: data,
      });
    }

    return res.status(200).json({
      planId: data.id,
      name: data.name,
      amount: data.amount,
      interval: data.interval,
      intervalCount: data.intervalCount,
      active: data.active,
    });
  } catch (err) {
    console.error('Clover create-plan exception:', err);
    return res.status(500).json({ error: 'Internal server error: ' + err.message });
  }
}
