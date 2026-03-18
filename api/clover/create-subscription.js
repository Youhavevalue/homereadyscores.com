// POST /api/clover/create-subscription
// Subscribes a customer to a plan for recurring billing
// Body: { planId, customerId, amount (optional override in cents), startDate (optional ISO), endDate (optional ISO) }

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { planId, customerId, amount, startDate, endDate } = req.body;

  if (!planId || !customerId) {
    return res.status(400).json({ error: 'planId and customerId are required' });
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
      collectionMethod: 'CHARGE_AUTOMATICALLY',
      customerId,
    };

    // Optional overrides
    if (amount) payload.amount = Math.round(amount);
    if (startDate) payload.startDate = startDate;
    if (endDate) payload.endDate = endDate;

    const response = await fetch(`${baseUrl}/recurring/v1/plans/${planId}/subscriptions`, {
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
      console.error('Clover create-subscription error:', data);
      return res.status(response.status).json({
        error: data.message || 'Failed to create subscription',
        details: data,
      });
    }

    return res.status(200).json({
      subscriptionId: data.id,
      customerId: data.customerUuid,
      planId: data.plan?.id,
      amount: data.amount,
      total: data.total,
      active: data.active,
      startDate: data.startDate,
      collectionMethod: data.collectionMethod,
    });
  } catch (err) {
    console.error('Clover create-subscription exception:', err);
    return res.status(500).json({ error: 'Internal server error: ' + err.message });
  }
}
