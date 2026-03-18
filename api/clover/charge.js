// POST /api/clover/charge
// Creates a one-time charge (e.g. setup fee)
// Body: { amount (in cents), currency, source (clv_ token OR customerId), description }

import { randomUUID } from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, currency = 'usd', source, description } = req.body;

  if (!amount || !source) {
    return res.status(400).json({ error: 'amount (in cents) and source are required' });
  }

  if (amount < 50) {
    return res.status(400).json({ error: 'Minimum charge amount is 50 cents ($0.50)' });
  }

  const accessToken = process.env.CLOVER_ACCESS_TOKEN;
  if (!accessToken) {
    return res.status(500).json({ error: 'Clover access token not configured' });
  }

  // Sandbox: scl-sandbox.dev.clover.com | Production: scl.clover.com
  const baseUrl = 'https://scl-sandbox.dev.clover.com';
  const idempotencyKey = randomUUID();

  try {
    const payload = {
      amount: Math.round(amount),
      currency,
      source,
    };

    // Add description if provided
    if (description) {
      payload.description = description;
    }

    const response = await fetch(`${baseUrl}/v1/charges`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'idempotency-key': idempotencyKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Clover charge error:', data);
      return res.status(response.status).json({
        error: data.message || 'Charge failed',
        details: data,
      });
    }

    return res.status(200).json({
      chargeId: data.id,
      amount: data.amount,
      currency: data.currency,
      status: data.status,
      outcome: data.outcome,
      created: data.created,
    });
  } catch (err) {
    console.error('Clover charge exception:', err);
    return res.status(500).json({ error: 'Internal server error: ' + err.message });
  }
}
