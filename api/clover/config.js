// GET /api/clover/config
// Manual launch returns mode/status only. Tokenization configuration stays disabled.

import { BILLING_MODE, AUTOMATED_BILLING_ENABLED } from '../../shared/billing-mode.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!AUTOMATED_BILLING_ENABLED) {
    return res.status(200).json({ billingMode: BILLING_MODE, automatedBillingEnabled: false });
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
