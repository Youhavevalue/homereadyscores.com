// GET /api/clover/config
// Returns the public Clover API key and merchant ID needed for the iframe tokenization
// This endpoint is safe to expose to the frontend — it only returns public keys

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiAccessKey = process.env.CLOVER_API_ACCESS_KEY;
  const merchantId = process.env.CLOVER_MERCHANT_ID;

  if (!apiAccessKey || !merchantId) {
    return res.status(500).json({ error: 'Clover configuration not set' });
  }

  return res.status(200).json({
    apiAccessKey,
    merchantId,
    // Sandbox SDK URL — switch to checkout.clover.com for production
    sdkUrl: 'https://checkout.sandbox.dev.clover.com/sdk.js',
  });
}
