import { requireAdmin, sameOrigin } from './_lib/portal-session.js';
import { serverDb } from './_lib/server-db.js';

export default async function handler(req,res) {
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
 if(!await requireAdmin(req,res))return;
 if(!sameOrigin(req))return res.status(403).json({error:'Use the team dashboard.'});
 const q=req.query||{},days=q.days??'7',internal=q.includeInternal??'0';
 if(Object.keys(q).some(k=>!['days','includeInternal'].includes(k))||!['2','7','30','90'].includes(days)||!['0','1'].includes(internal))return res.status(400).json({error:'Choose 48 hours, 7, 30 or 90 days and a valid traffic filter.'});
 try {
  const {data,error}=await serverDb().rpc('analytics_dashboard',{p_days:Number(days),p_include_internal:internal==='1'});
  if(error||!data||data.version!==1||data.days!==Number(days)||data.include_internal!==(internal==='1')||!data.summary||!Array.isArray(data.daily)||!Array.isArray(data.channels)||!Array.isArray(data.pages)||!Array.isArray(data.plans)||!Array.isArray(data.steps))throw Error('Unavailable');
  return res.status(200).json({...data,card_collection:{enabled:process.env.HRS_CARD_STORAGE_ENABLED==='true',automatic_charging:false}});
 }catch{return res.status(503).json({error:'Analytics could not be refreshed. Please retry; no zero-count result has been assumed.'});}
}
