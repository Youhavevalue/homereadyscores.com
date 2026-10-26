import { requireAdmin } from './_lib/portal-session.js';
import { serverDb } from './_lib/server-db.js';
export default async function handler(req,res) {
 if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
 if(!await requireAdmin(req,res))return;
 const days=req.query?.days===undefined?'7':req.query.days;
 if(!['7','30'].includes(days))return res.status(400).json({error:'Select seven or thirty days.'});
 try{const {data,error}=await serverDb().rpc('website_funnel_metrics',{p_days:Number(days)});if(error||!data||data.days!==Number(days)||!Number.isSafeInteger(data.confirmed_requests)||!Number.isSafeInteger(data.sessions)||!data.events||!Array.isArray(data.sources))return res.status(503).json({error:'Website report unavailable.'});return res.status(200).json(data);}catch{return res.status(503).json({error:'Website report unavailable.'});}
}
