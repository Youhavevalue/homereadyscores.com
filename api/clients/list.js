import { requireAdmin, sameOrigin } from '../_lib/portal-session.js';
import { serverDb } from '../_lib/server-db.js';

const PAGE_SIZE = 50;
const MAX_PAGE = 100000;
const CLIENT_FIELDS = 'id,first_name,last_name,email,phone,status,created_at,updated_at,assigned_to,next_action,next_action_at,results_expected_date';
const PAYMENT_FIELDS = 'id,client_id,setup_fee_amount,monthly_amount,setup_fee_status,monthly_status,created_at';
const STATUSES = new Set(['scheduled', 'pending', 'active', 'contact1', 'contact2', 'contact3', 'complete', 'nsf', 'cancelled', 'expired', 'on_hold', 'completed', 'closed']);
const unavailable = res => res.status(503).json({ error: 'Client list could not be loaded. Please retry; no empty result has been assumed.' });

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!sameOrigin(req)) return res.status(403).json({ error: 'Use the team portal to view clients.' });
  const member = await requireAdmin(req, res);
  if (!member) return;

  const query = req.query || {};
  const rawPage = query.page ?? '0';
  const search = query.q ?? '';
  const status = query.status ?? '';
  if (typeof rawPage !== 'string' || !/^(0|[1-9]\d{0,5})$/.test(rawPage) || Number(rawPage) > MAX_PAGE) {
    return res.status(400).json({ error: 'Select a valid client page.' });
  }
  // PostgREST OR is a raw expression. Reject its syntax and wildcard characters
  // rather than allowing user input to change the four fixed ilike predicates.
  if (typeof search !== 'string' || search.length > 100 || /[^\p{L}\p{N} @.+'-]/u.test(search)) {
    return res.status(400).json({ error: 'Search supports letters, numbers, spaces, @, period, plus, hyphen and apostrophe (up to 100 characters).' });
  }
  if (typeof status !== 'string' || (status && !STATUSES.has(status))) {
    return res.status(400).json({ error: 'Select a valid client status.' });
  }

  const page = Number(rawPage);
  try {
    const db = serverDb();
    let clientQuery = db.from('clients').select(CLIENT_FIELDS, { count: 'exact' })
      .order('created_at', { ascending: false }).order('id', { ascending: false });
    const term = search.trim();
    if (term) clientQuery = clientQuery.or(['first_name', 'last_name', 'email', 'phone']
      .map(field => `${field}.ilike.%${term}%`).join(','));
    if (status) clientQuery = clientQuery.eq('status', status);
    const { data: clients, count: total, error } = await clientQuery.range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
    if (error || !Array.isArray(clients) || !Number.isSafeInteger(total) || total < 0) return unavailable(res);

    let payments = [];
    if (clients.length) {
      const paymentResult = await db.from('payments').select(PAYMENT_FIELDS)
        .in('client_id', clients.map(client => client.id)).order('created_at', { ascending: false });
      if (paymentResult.error || !Array.isArray(paymentResult.data)) return unavailable(res);
      payments = paymentResult.data;
    }
    return res.status(200).json({
      clients: clients.map(client => ({ ...client, payments: payments.filter(payment => payment.client_id === client.id) })),
      page, pageSize: PAGE_SIZE, total,
    });
  } catch {
    return unavailable(res);
  }
}
