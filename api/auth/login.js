import bcrypt from 'bcryptjs';
import { serverDb } from '../_lib/server-db.js';
import { publicMember, sameOrigin, setSession } from '../_lib/portal-session.js';
import { consumeLoginAttempt } from '../_lib/login-throttle.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error:'Method not allowed' });
  if (!sameOrigin(req)) return res.status(403).json({ error:'Use the team portal to sign in.' });
  const contentType = req.headers?.['content-type'];
  if (typeof contentType !== 'string' || !/^application\/json(?:\s*;|$)/i.test(contentType.trim())) return res.status(415).json({ error:'Submit a JSON sign-in request.' });
  const body = req.body;
  if (!body || typeof body.email !== 'string' || typeof body.password !== 'string' || !body.email.trim() || body.email.length > 254 || !body.password || body.password.length > 256) return res.status(400).json({ error:'Email and password are required.' });
  try {
    const budget = await consumeLoginAttempt(req, body.email);
    if (!budget.allowed) {
      res.setHeader('Retry-After', String(budget.retryAfterSeconds));
      return res.status(429).json({ error:'Too many sign-in attempts. Please try again later.' });
    }
    const { data:member, error } = await serverDb().from('team_members').select('id,email,name,role,password_hash').eq('email',body.email.trim().toLowerCase()).maybeSingle();
    if (error) return res.status(503).json({ error:'Team access is temporarily unavailable. Please retry.' });
    if (!member || typeof member.password_hash !== 'string' || !await bcrypt.compare(body.password, member.password_hash)) return res.status(401).json({ error:'Invalid email or password.' });
    if (member.role !== 'admin') return res.status(403).json({ error:'An authorized administrator is required.' });
    setSession(req, res, member, body.rememberDevice === true);
    return res.status(200).json(publicMember(member));
  } catch { return res.status(503).json({ error:'Team access is temporarily unavailable. Please retry.' }); }
}
