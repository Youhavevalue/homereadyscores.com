export const CREDIT_CONCERNS = [
  ['collections', 'Collections'],
  ['late_payments', 'Late payments'],
  ['high_balances', 'High balances'],
  ['unfamiliar_entries', 'An entry I don’t recognize or think is wrong'],
  ['limited_history', 'Limited credit history'],
  ['unsure', 'I’m not sure'],
];

// Older saved leads used a single string. Keep them editable without rewriting them.
export function concernValues(value) {
  return Array.isArray(value) ? [...new Set(value)] : typeof value === 'string' && value ? [value] : [];
}

export function concernLabels(value) {
  return concernValues(value).map(id => CREDIT_CONCERNS.find(([key]) => key === id)?.[1]).filter(Boolean).join('; ') || 'Not provided';
}
