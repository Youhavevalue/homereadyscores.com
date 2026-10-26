import {requireAdmin,sameOrigin} from './portal-session.js';
import {staffSessionBinding,digestCardValue} from './card-session-binding.js';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function createStaffCardSession({adminReader=requireAdmin}={}){
 async function authorize(req,enrollmentId){
  if(!['GET','POST'].includes(req?.method)||!sameOrigin(req)||req.headers?.['sec-fetch-site']==='cross-site'||!UUID.test(enrollmentId||'')||req.method==='POST'&&typeof req.headers?.origin!=='string')throw Object.assign(Error('Use the staff workspace.'),{status:403});
  let status=401;const response={setHeader(){},status(n){status=n;return this;},json(){return this;}};
  const member=await adminReader(req,response);if(!member)throw Object.assign(Error('Sign in to the staff workspace.'),{status});
  return{memberId:member.id,enrollmentId,sessionBinding:staffSessionBinding(req),credentialVersion:digestCardValue(member.password_hash)};
 }
 return{authorize,authorizeRemoval:authorize};
}
