import { publicJsonBody, websiteNetworkKey } from './_lib/website-guards.js';
import { serverDb } from './_lib/server-db.js';
import { validPublicEvent } from '../shared/website-tracking.js';
export default async function handler(req,res) {
 if(!publicJsonBody(req,res,2048))return;
 if(!validPublicEvent(req.body))return res.status(400).json({error:'Invalid website event.'});
 try{
  const b=req.body,{data,error}=await serverDb().rpc('record_website_event',{p_session:b.sessionId,p_action:b.action,p_path:b.path,p_attribution:b.attribution,p_network:websiteNetworkKey(req)});
  if(error||!data||typeof data.allowed!=='boolean'||typeof data.recorded!=='boolean')return res.status(503).json({error:'Website measurement unavailable.'});
  if(!data.allowed){res.setHeader('Retry-After',String(data.retry_after_seconds||900));return res.status(429).json({error:'Website measurement limit reached.'});}
  return res.status(202).json({recorded:data.recorded});
 }catch{return res.status(503).json({error:'Website measurement unavailable.'});}
}
