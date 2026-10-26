import { funnelToken } from './credit-funnel.js';
import { randomUUID } from 'node:crypto';
import { publicJsonBody, websiteNetworkKey, inquiryFingerprint } from './website-guards.js';
import { UUID, validateAttribution } from '../../shared/website-tracking.js';
// Save a request for staff review only. No client activation, CRM automation,
// payment records, card tokens or Clover calls belong in this path.
const GOALS = ['Buy a Home', 'Buy a Car', 'Refinance Loan', 'General Repair', 'Other'];
const PRICES = {
  single: { initial: 18999, monthly: 10000 },
  couple: { initial: 37999, monthly: 16000 },
};

export async function handleManualEnrollment(req, res, supabase) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!publicJsonBody(req,res)) return;
  const body = req.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ error: 'An enrollment request is required.' });
  }
  if ('source' in body || 'card' in body || 'cardNumber' in body || 'cvv' in body) {
    return res.status(400).json({ error: 'Do not submit card information with an enrollment request.' });
  }
  const firstName = typeof body.firstName === 'string' ? body.firstName.trim() : '';
  const lastName = typeof body.lastName === 'string' ? body.lastName.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const phone = typeof body.phone === 'string' ? body.phone.replace(/\D/g, '') : '';
  const billingZip = typeof body.billingZip === 'string' ? body.billingZip.trim() : '';
  if (!firstName || !lastName || firstName.length > 100 || lastName.length > 100) {
    return res.status(400).json({ error: 'First and last name are required (up to 100 characters each).' });
  }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }
  if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(phone) || /^(.)\1{9}$/.test(phone)) {
    return res.status(400).json({ error: 'A valid 10-digit US phone number is required.' });
  }
  if (typeof body.plan !== 'string' || !Object.hasOwn(PRICES, body.plan) || !GOALS.includes(body.goal)) {
    return res.status(400).json({ error: 'Select a valid plan and goal.' });
  }
  if (body.creditReportAgreement !== true || !/^\d{5}$/.test(billingZip)) {
    return res.status(400).json({ error: 'The credit report acknowledgment and a five-digit billing ZIP are required.' });
  }

  const submissionKey=body.submissionKey === undefined ? randomUUID() : body.submissionKey;
  const sessionId=body.sessionId === undefined ? randomUUID() : body.sessionId;
  const attribution=validateAttribution(body.attribution === undefined ? {} : body.attribution);
  if(!UUID.test(submissionKey || '') || !UUID.test(sessionId || '') || !attribution) return res.status(400).json({error:'Invalid request context. Reload the form and try again.'});
  const request={first_name:firstName,last_name:lastName,email,phone,goal:body.goal,plan:body.plan,billing_zip:billingZip,credit_report_agreement:true};
  try {
    const token=body.funnel===true?funnelToken(req):null;
    if(body.funnel===true&&!token)return res.status(409).json({error:'Return to the credit questionnaire and save your contact details before submitting.'});
    const { data, error } = await supabase.rpc(body.funnel===true?'submit_credit_funnel_enrollment':'submit_website_inquiry',{
      p_key:submissionKey,p_fingerprint:inquiryFingerprint(request),p_request:request,
      p_attribution:attribution,p_session:sessionId,p_network:websiteNetworkKey(req),...(body.funnel===true?{p_token:token}:{}),
    });
    if(['PT404','PT409'].includes(error?.code))return res.status(409).json({error:'Your saved contact details changed or expired. Return to the questionnaire to confirm them before submitting.'});
    if(error?.code==='22023') return res.status(409).json({error:'This save attempt has different details. Your earlier request may already be saved. Check your reference or email help@homereadyscores.com before starting another inquiry.'});
    if(!error && data?.allowed===false) { res.setHeader('Retry-After',String(data.retry_after_seconds || 3600));return res.status(429).json({error:'Too many new requests. Please wait before trying again, or email help@homereadyscores.com. No payment was attempted.'}); }
    if (error || !data?.request_id) return res.status(503).json({error:'Unable to confirm your request. Retry with the same details to avoid a duplicate. No payment was attempted.'});
    return res.status(201).json({
      success: true,
      billingMode: 'manual',
      status: 'pending_manual_review',
      requestId: data.request_id,
    });
  } catch {
    return res.status(503).json({ error: 'Unable to save your request. Please try again. No payment was attempted.' });
  }
}
