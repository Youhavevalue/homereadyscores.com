import { requireAdmin, publicMember } from '../_lib/portal-session.js';
export default async function handler(req,res) {
  if (req.method !== 'GET') return res.status(405).json({error:'Method not allowed'});
  const member = await requireAdmin(req,res);
  if (member) return res.status(200).json(publicMember(member));
}
