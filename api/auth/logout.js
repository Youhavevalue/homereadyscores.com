import { clearSession, sameOrigin } from '../_lib/portal-session.js';
export default async function handler(req,res) {
  res.setHeader('Cache-Control','no-store');
  if (req.method !== 'POST') return res.status(405).json({error:'Method not allowed'});
  if (!sameOrigin(req)) return res.status(403).json({error:'Use the team portal to sign out.'});
  clearSession(req,res);
  return res.status(200).json({success:true});
}
