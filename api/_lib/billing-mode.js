import { AUTOMATED_BILLING_ENABLED } from '../../shared/billing-mode.js';

export function requireAutomatedBilling(res) {
  if (AUTOMATED_BILLING_ENABLED) return true;
  res.status(423).json({
    code: 'AUTOMATED_BILLING_DISABLED',
    error: 'Automatic website billing is disabled. Payments are handled separately by our team.',
  });
  return false;
}
