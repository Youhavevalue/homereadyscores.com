// Cookies authorize access; no contact draft or lead token is stored in the browser.
export async function funnelRequest(action, payload = {}, request = globalThis.fetch) {
  const response = await request('/api/credit-funnel', {
    method: action ? 'POST' : 'GET', credentials: 'same-origin', cache: 'no-store',
    headers: action ? { 'Content-Type': 'application/json' } : {},
    ...(action ? { body: JSON.stringify({ ...payload, action }) } : {}),
  });
  let result; try { result = await response.json(); } catch { throw Error('We couldn’t confirm your request. Please try again.'); }
  if (!response.ok) { const error = Error(result.error || 'We couldn’t confirm your request. Please try again.'); error.status = response.status; error.previewOnly = result.previewOnly === true; throw error; }
  if (result.success !== true || !result.lead?.id || typeof result.lead.firstName !== 'string' || typeof result.lead.email !== 'string' || typeof result.lead.goal !== 'string') throw Error('We couldn’t confirm that your details were saved. Please try again.');
  return result;
}
export function enrollmentPrefill(lead) {
  const result = {};
  for (const name of ['firstName', 'lastName', 'email', 'phone', 'goal']) result[name] = typeof lead[name] === 'string' ? lead[name] : '';
  return result;
}
