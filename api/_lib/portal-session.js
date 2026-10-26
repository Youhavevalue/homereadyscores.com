import { createHmac, timingSafeEqual } from 'node:crypto';
import { serverDb } from './server-db.js';

const TTL = 4 * 60 * 60;
const REMEMBERED_TTL = 30 * 24 * 60 * 60;
const AUDIENCE = 'home-ready-scores:home_ready:portal:v1';
function key() {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const project = process.env.VITE_SUPABASE_URL;
  if (!secret || !project) throw new Error('Portal unavailable');
  return createHmac('sha256', secret).update(`${AUDIENCE}:${project}`).digest();
}
const mac = value => createHmac('sha256', key()).update(value).digest('base64url');
const credentialVersion = member => mac(`credential:${member.id}:${member.password_hash}`);
function secure(req) { return process.env.VERCEL === '1' || req.headers?.['x-forwarded-proto'] === 'https'; }
export function portalSessionCookieName(req) { return secure(req) ? '__Host-hrs_session' : 'hrs_local_session'; }
export function sameOrigin(req) {
  const origin = req.headers?.origin;
  if (!origin) return true;
  try { const protocol = secure(req) ? 'https:' : 'http:'; return new URL(origin).origin === `${protocol}//${req.headers?.host}`; } catch { return false; }
}
export function setSession(req, res, member, rememberDevice = false) {
  const lifetime = rememberDevice === true ? REMEMBERED_TTL : TTL;
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({ v:1, aud:AUDIENCE, sub:member.id, iat:now, exp:now+lifetime, cv:credentialVersion(member) })).toString('base64url');
  res.setHeader('Set-Cookie', `${portalSessionCookieName(req)}=${payload}.${mac(payload)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${lifetime}${secure(req) ? '; Secure' : ''}`);
}
export function clearSession(req, res) {
  res.setHeader('Set-Cookie', `${portalSessionCookieName(req)}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure(req) ? '; Secure' : ''}`);
}
export function publicMember(member) { return { id:member.id, email:member.email, name:member.name, role:member.role }; }
export async function requireAdmin(req, res, dbProvider = serverDb) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const cookies = String(req.headers?.cookie || '').split(';').map(x => x.trim());
    const token = cookies.find(x => x.startsWith(`${portalSessionCookieName(req)}=`))?.slice(portalSessionCookieName(req).length+1);
    if (!token || token.length > 2000) return deny(res,401,'Sign in to the team portal.');
    const parts = token.split('.');
    if (parts.length !== 2 || !parts.every(x => /^[A-Za-z0-9_-]+$/.test(x))) return deny(res,401,'Session expired. Sign in again.');
    const signature = Buffer.from(parts[1], 'base64url');
    const expected = Buffer.from(mac(parts[0]), 'base64url');
    if (signature.length !== expected.length || !timingSafeEqual(signature, expected)) return deny(res,401,'Session expired. Sign in again.');
    let payload;
    try { payload = JSON.parse(Buffer.from(parts[0], 'base64url').toString()); } catch { return deny(res,401,'Session expired. Sign in again.'); }
    const now = Math.floor(Date.now()/1000);
    if (payload.v !== 1 || payload.aud !== AUDIENCE || typeof payload.sub !== 'string' || !Number.isInteger(payload.iat) || !Number.isInteger(payload.exp) || payload.exp <= now || payload.iat > now+60 || ![TTL, REMEMBERED_TTL].includes(payload.exp-payload.iat)) return deny(res,401,'Session expired. Sign in again.');
    const { data:member, error } = await dbProvider().from('team_members').select('id,email,name,role,password_hash').eq('id',payload.sub).maybeSingle();
    if (error) return deny(res,503,'Team access is temporarily unavailable. Please retry.');
    if (!member) return deny(res,401,'Session expired. Sign in again.');
    if (member.role !== 'admin') return deny(res,403,'An authorized administrator is required.');
    if (payload.cv !== credentialVersion(member)) return deny(res,401,'Session expired. Sign in again.');
    return member;
  } catch { return deny(res,503,'Team access is temporarily unavailable. Please retry.'); }
}
function deny(res, status, error) { res.status(status).json({ error }); return null; }
