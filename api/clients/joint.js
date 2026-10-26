import { randomUUID } from 'node:crypto';
import { requireAdmin, sameOrigin } from '../_lib/portal-session.js';
import { serverDb } from '../_lib/server-db.js';

function person(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).some(k => !['first_name', 'last_name', 'email'].includes(k))) return null;
  const result = {};
  for (const field of ['first_name', 'last_name', 'email']) {
    const raw = value[field] ?? '';
    if (typeof raw !== 'string' || raw.length > (field === 'email' ? 254 : 100)) return null;
    result[field] = raw.trim();
  }
  if (!result.first_name || !result.last_name || (result.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.email))) return null;
  return result;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!sameOrigin(req)) return res.status(403).json({ error: 'Use the team portal for this operation.' });
  if (!String(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) return res.status(415).json({ error: 'JSON request required.' });
  if (!await requireAdmin(req, res)) return;
  const body = req.body;
  const primary = person(body?.primary), joint = person(body?.joint);
  if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).some(k => !['primary', 'joint'].includes(k)) || !primary || !joint) return res.status(400).json({ error: 'Enter valid names and optional email addresses for both clients.' });
  const primaryId = randomUUID(), jointId = randomUUID();
  const rows = [
    { ...primary, id: primaryId, status: 'pending', notes: `Joint — primary; paired client ${jointId}` },
    { ...joint, id: jointId, status: 'pending', notes: `Joint with primary client ${primaryId}` },
  ];
  try {
    // One PostgREST insert statement commits both records or neither record.
    const { data, error } = await serverDb().from('clients').insert(rows).select('id');
    if (error || !Array.isArray(data) || data.length !== 2) return res.status(503).json({ error: 'Joint client records could not be saved. Please retry.' });
    return res.status(201).json({ primaryId, jointId });
  } catch {
    return res.status(503).json({ error: 'Joint client records are temporarily unavailable. Please retry.' });
  }
}
