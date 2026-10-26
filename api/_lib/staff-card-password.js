import{randomBytes}from'node:crypto';
import bcrypt from'bcryptjs';
import{requireAdmin,sameOrigin}from'./portal-session.js';
import{websiteNetworkKey}from'./website-guards.js';
import{staffSessionBinding,digestCardValue}from'./card-session-binding.js';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function createStaffCardPassword({db,adminReader=requireAdmin,networkKey=websiteNetworkKey}={}){
 async function rpc(name,args){const{data,error}=await db.rpc(name,args);if(error)throw Object.assign(Error('Staff card authorization could not be confirmed.'),{status:{42501:403,PT403:403,PT404:404,22023:400}[error.code]||503});return data;}
 return{
 async authorizeRemoval(req,trustedRequestId){
  if(req?.method!=='POST'||!sameOrigin(req)||typeof req.headers?.origin!=='string'||req.headers?.['sec-fetch-site']==='cross-site'||!UUID.test(trustedRequestId||'')||req.body?.requestId!==trustedRequestId)throw Object.assign(Error('Use the staff card-access form.'),{status:400});
  let status=401;const response={setHeader(){},status(value){status=value;return this;},json(){return this;}};
  const member=await adminReader(req,response);if(!member)throw Object.assign(Error('Current staff session/access is required.'),{status});
  // Removal exposes no card data and must remain available after authorization,
  // even when the existing full-card/password-attempt budget is exhausted.
  return{memberId:member.id,enrollmentId:trustedRequestId,sessionBinding:staffSessionBinding(req),credentialVersion:digestCardValue(member.password_hash)};
 },
 async authorize(req,trustedRequestId){
  const body=req?.body;
  if(req?.method!=='POST'||!sameOrigin(req)||typeof req.headers?.origin!=='string'||req.headers?.['sec-fetch-site']==='cross-site'||!/^application\/json(?:\s*;|$)/i.test(req.headers?.['content-type']||'')||!body||typeof body!=='object'||Array.isArray(body)||Buffer.byteLength(JSON.stringify(body))>1024||Object.keys(body).some(key=>!['requestId','password'].includes(key))||!UUID.test(trustedRequestId||'')||body.requestId!==trustedRequestId)throw Object.assign(Error('Use the staff card-access form.'),{status:400});
  let status=401;const response={setHeader(){},status(value){status=value;return this;},json(){return this;}};
  const member=await adminReader(req,response);if(!member)throw Object.assign(Error('Current staff session/access is required.'),{status});
  const version=digestCardValue(member.password_hash),session=staffSessionBinding(req);
  if(await rpc('consume_card_access_budget',{p_actor:member.id,p_network:networkKey(req),p_scope:'grant'})!==true)throw Object.assign(Error('Too many card-access attempts. Please wait 15 minutes.'),{status:429});
  if(typeof body.password!=='string'||body.password.length>256||!await bcrypt.compare(body.password,member.password_hash))throw Object.assign(Error('Re-enter your staff password.'),{status:401});
  // The grant stays server-side. SQL rechecks current role/credential version,
  // and existing read consumes it atomically with the required audit insert.
  const grantHash=digestCardValue(randomBytes(32).toString('base64url'));
  await rpc('issue_password_card_reveal_grant',{p_actor:member.id,p_version:version,p_session:session,p_enrollment:trustedRequestId,p_grant:grantHash});
  return{memberId:member.id,enrollmentId:trustedRequestId,sessionBinding:session,credentialVersion:version,grantHash};
 }};
}
