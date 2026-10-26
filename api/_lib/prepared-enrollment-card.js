import{requireAdmin,sameOrigin}from'./portal-session.js';
import{describeCardCapture}from'./public-card-enrollment.js';
import{createPreparedCardRevealHandler}from'./prepared-card-http.js';
import{UUID}from'../../shared/website-tracking.js';
export function createPreparedEnrollmentCardHandler({db,capture,service,revealFields,adminReader=requireAdmin}={}){
 const reveal=createPreparedCardRevealHandler({service,fields:revealFields});
 return async(req,res)=>{res.setHeader('Cache-Control','no-store');const description=describeCardCapture(capture);
  if(req.method==='GET'&&req.query?.action==='capability')return res.status(200).json(description);
  if(!description.enabled)return res.status(503).json({enabled:false,error:'Card storage is not enabled.'});
  if(req.method==='POST')return reveal(req,res);
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  if(!sameOrigin(req)||req.headers?.['sec-fetch-site']==='cross-site')return res.status(403).json({error:'Use the staff portal.'});
  if(!UUID.test(req.query?.requestId||'')||Object.keys(req.query||{}).some(key=>key!=='requestId'))return res.status(400).json({error:'Select a valid enrollment.'});
  const member=await adminReader(req,res);if(!member)return;
  try{const{data,error}=await db.rpc('enrollment_card_metadata',{p_id:req.query.requestId,p_actor:member.id});if(error||typeof data?.cardSaved!=='boolean')return res.status(error?.code==='42501'?403:error?.code==='PT404'?404:503).json({error:'Saved card status unavailable.'});return res.status(200).json({...description,cardSaved:data.cardSaved,last4:data.last4});}catch{return res.status(503).json({error:'Saved card status unavailable.'});}
 };
}
