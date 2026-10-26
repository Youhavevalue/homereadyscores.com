import{handleManualEnrollment}from'./manual-enrollment.js';
import{publicJsonBody,websiteNetworkKey}from'./website-guards.js';
import{funnelToken}from'./credit-funnel.js';
import{rejectSecurityCode,withoutCardSecurityCode}from'./card-input.js';
import{UUID,validateAttribution}from'../../shared/website-tracking.js';
const CAPABILITIES=new WeakSet();
const TEST_CARDS=new Set(['4111111111111111','5555555555554444','371449635398431']);
export function createControlledCardCapture({service,syntheticOnly=true,securityCodeRequired=false}={}){
 if(typeof service?.save!=='function')throw Error('A configured card-storage service is required.');
 const capture=Object.freeze({syntheticOnly:syntheticOnly===true,securityCodeRequired:securityCodeRequired===true,save:input=>service.save(input)});CAPABILITIES.add(capture);return capture;
}
export function describeCardCapture(capture){return CAPABILITIES.has(capture)?{enabled:true,syntheticOnly:capture.syntheticOnly,staffMfaRequired:false,...(capture.securityCodeRequired?{securityCodeRequired:true}:{})}:{enabled:false};}
const fields=['firstName','lastName','email','phone','goal','plan','billingZip','creditReportAgreement','submissionKey','sessionId','attribution','funnel','card'];
function normalize(b){
 if(Object.keys(b).some(key=>!fields.includes(key)))throw Error('Unsupported enrollment field.');
 const r={first_name:typeof b.firstName==='string'?b.firstName.trim():'',last_name:typeof b.lastName==='string'?b.lastName.trim():'',email:typeof b.email==='string'?b.email.trim().toLowerCase():'',phone:typeof b.phone==='string'?b.phone.replace(/\D/g,''):'',goal:b.goal,plan:b.plan,billing_zip:typeof b.billingZip==='string'?b.billingZip.trim():'',credit_report_agreement:b.creditReportAgreement};
 if(!r.first_name||r.first_name.length>100||!r.last_name||r.last_name.length>100||r.email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email)||!/^[2-9]\d{2}[2-9]\d{6}$/.test(r.phone)||/^(.)\1{9}$/.test(r.phone)||!['single','couple'].includes(r.plan)||!['Buy a Home','Buy a Car','Refinance Loan','General Repair','Other'].includes(r.goal)||!/^\d{5}$/.test(r.billing_zip)||r.credit_report_agreement!==true||!UUID.test(b.submissionKey||'')||!UUID.test(b.sessionId||'')||!validateAttribution(b.attribution||{})||b.funnel!==undefined&&typeof b.funnel!=='boolean')throw Error('Check your enrollment details and reload the form if necessary.');return r;
}
export function createPublicEnrollmentController({db,capture}={}){
 return{
  capability(req,res){res.setHeader('Cache-Control','no-store');if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});return res.status(200).json(describeCardCapture(capture));},
  async enroll(req,res){if(!publicJsonBody(req,res,8192))return;try{rejectSecurityCode(capture?.securityCodeRequired?withoutCardSecurityCode(req.body):req.body);}catch{return res.status(400).json({error:'Do not submit a card security code.'});}
   if(!Object.hasOwn(req.body,'card')){if(CAPABILITIES.has(capture))return res.status(400).json({error:'Card details are required to complete this enrollment. Reload the form and try again.'});return handleManualEnrollment(req,res,db);}
   if(!CAPABILITIES.has(capture))return res.status(503).json({error:'Card storage is not enabled. No enrollment or card was saved by this request.'});
   let request;try{request=normalize(req.body);}catch(error){return res.status(400).json({error:error.message});}
   const token=req.body.funnel===true?funnelToken(req):null;if(req.body.funnel===true&&!token)return res.status(409).json({error:'Return to credit help to confirm your saved details before enrolling.'});
   if(capture.syntheticOnly&&(!/\.test$/i.test(request.email)||!/^\d{3}55501\d{2}$/.test(request.phone)||!TEST_CARDS.has(String(req.body.card?.number||'').replace(/[ -]/g,''))))return res.status(400).json({error:'Use only fictional personal details and a displayed test card in this review.'});
   try{const result=await capture.save({submissionKey:req.body.submissionKey,sessionId:req.body.sessionId,request,card:req.body.card,attribution:req.body.attribution||{},networkKey:websiteNetworkKey(req),...(token?{funnelToken:token}:{})});if(result.cardSaved!==true||!UUID.test(result.requestId||''))throw Error('Save unconfirmed');return res.status(201).json({...result,syntheticOnly:capture.syntheticOnly});}catch(error){if(error.status===429){res.setHeader('Retry-After',String(error.retryAfterSeconds||3600));return res.status(429).json({error:'Too many enrollment requests. Please wait before trying again.'});}const validation=/valid card|cardholder|security code|Unsupported|expiration|expiry|billing|Complete the card|Enter /i.test(error.message||'');const conflict=/changed|different|historical|existing enrollment/i.test(error.message||'');return res.status(validation?400:conflict?409:503).json({error:validation?error.message:conflict?'Your earlier request has different details. Keep its reference and contact staff before starting another.':'Enrollment and card storage could not be confirmed. Retry with the same details to avoid a duplicate.'});}
  },
 };
}
