import { createHmac } from 'node:crypto';
import { clientNetwork } from './login-throttle.js';
import { sameOrigin } from './portal-session.js';
function digest(value) {
  const secret=process.env.SUPABASE_SERVICE_ROLE_KEY,project=process.env.VITE_SUPABASE_URL;
  if(!secret||!project) throw new Error('Website processing unavailable');
  const key=createHmac('sha256',secret).update(`home-ready-scores:website:v1:${project}`).digest();
  return createHmac('sha256',key).update(value).digest('hex');
}
export const websiteNetworkKey = req => digest('network:'+clientNetwork(req));
export const inquiryFingerprint = request => digest('inquiry:'+JSON.stringify(request));
export function publicJsonBody(req,res,maxBytes=4096) {
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST') { res.status(405).json({error:'Method not allowed'});return false; }
  if(!sameOrigin(req) || req.headers?.['sec-fetch-site']==='cross-site' || (typeof req.headers?.origin!=='string' && req.headers?.['sec-fetch-site']!=='same-origin')) { res.status(403).json({error:'Use this website to submit the request.'});return false; }
  if(!/^application\/json(?:\s*;|$)/i.test(req.headers?.['content-type']||'')) {res.status(415).json({error:'Use a JSON request.'});return false;}
  try {
    if(!req.body||typeof req.body!=='object'||Array.isArray(req.body)) {res.status(400).json({error:'A request object is required.'});return false;}
    if(Buffer.byteLength(JSON.stringify(req.body),'utf8')>maxBytes) {res.status(413).json({error:'Request is too large.'});return false;}
  }catch{res.status(400).json({error:'Invalid request.'});return false;}
  return true;
}
