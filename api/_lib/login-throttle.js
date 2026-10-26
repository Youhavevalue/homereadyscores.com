import { createHmac } from 'node:crypto';
import { isIP } from 'node:net';
import { serverDb } from './server-db.js';

const CONTEXT = 'home-ready-scores:home_ready:login-throttle:v1';

export function clientNetwork(req) {
  // Vercel supplies this header independently of forwarding overrides. Never use
  // caller-supplied X-Forwarded-For on other hosts: use the actual socket peer.
  // https://vercel.com/docs/headers/request-headers#x-vercel-forwarded-for
  const raw = process.env.VERCEL === '1'
    ? req.headers?.['x-vercel-forwarded-for']
    : req.socket?.remoteAddress;
  if (typeof raw !== 'string' || raw.length > 64 || raw.includes('%')) throw new Error('Login limiter unavailable');
  const ip = raw.trim();
  const version = isIP(ip);
  if (version === 4) return `ipv4:${ip}`;
  if (version !== 6) throw new Error('Login limiter unavailable');

  // URL normalizes equivalent IPv6 spellings (including dotted mapped IPv4).
  const canonical = new URL(`http://[${ip}]/`).hostname.slice(1,-1);
  const [left, right] = canonical.split('::');
  const head = left ? left.split(':') : [];
  const tail = right ? right.split(':') : [];
  const groups = right === undefined ? head : [...head, ...Array(8-head.length-tail.length).fill('0'), ...tail];
  const words = groups.map(x => parseInt(x,16));
  if (words.slice(0,5).every(x => x === 0) && words[5] === 65535) {
    return `ipv4:${words[6] >>> 8}.${words[6] & 255}.${words[7] >>> 8}.${words[7] & 255}`;
  }
  // A /64 shares one IP budget so temporary IPv6 addresses cannot reset it.
  return `ipv6:${groups.slice(0,4).map(x => x.padStart(4,'0')).join('')}/64`;
}

export async function consumeLoginAttempt(req, email, scope = 'login') {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const project = process.env.VITE_SUPABASE_URL;
  if (!secret || !project || typeof email !== 'string' || !['login','contract-invite'].includes(scope)) throw new Error('Login limiter unavailable');
  const key = createHmac('sha256',secret).update(`${CONTEXT}${scope === 'login' ? '' : ':contract-invite'}:${project}`).digest();
  const hash = value => createHmac('sha256',key).update(value).digest('hex');
  const { data, error } = await serverDb().rpc('consume_login_attempt', {
    p_account_key:hash(`account:${email.trim().toLowerCase()}`),
    p_ip_key:hash(`ip:${clientNetwork(req)}`),
  });
  if (error || !data || Array.isArray(data) || typeof data.allowed !== 'boolean'
      || !Number.isInteger(data.retry_after_seconds)
      || (data.allowed ? data.retry_after_seconds !== 0 : data.retry_after_seconds < 1 || data.retry_after_seconds > 900)) {
    throw new Error('Login limiter unavailable');
  }
  return { allowed:data.allowed, retryAfterSeconds:data.retry_after_seconds };
}
