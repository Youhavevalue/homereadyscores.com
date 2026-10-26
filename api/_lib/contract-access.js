import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { requireAdmin, sameOrigin } from './portal-session.js';
import { serverDb } from './server-db.js';
import { consumeLoginAttempt } from './login-throttle.js';
import { DOCUMENT_BUCKET, MAX_DOCUMENT_BYTES, safeDocumentPath } from './document-access.js';

const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const KINDS=['consent','disclosure','agreement','cancellation'];
const AUDIENCE='home-ready-scores:home_ready:contract-signer:v1';
const TTL=1200;
const ACTIVATION={enabled:false,reason:'Service activation remains held pending adopted agreement and activation procedures.'};
function contractMode(){const mode=process.env.HRS_CONTRACTS_MODE;return mode==='prepare'||mode==='sign'?mode:'disabled';}
const newSigningHold=()=>new ContractError(423,'New signing is paused. Draft preparation and existing-case recovery remain available.');
function finiteTime(value){return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:[.]\d{1,6})?(?:Z|[+-]\d{2}(?::?\d{2})?)$/.test(value)&&Number.isFinite(Date.parse(value));}
function cancelledRecovery(row){const r=row?.record||{};return r.status==='cancelled'&&r.signedAt==null&&r.signatureName==null&&r.hold===true&&[r.approvedAt,r.offeredAt,r.cancellationAt].every(finiteTime)&&Date.parse(r.approvedAt)<=Date.parse(r.offeredAt)&&Date.parse(r.offeredAt)<=Date.parse(r.cancellationAt);}
function issuedRecoveryCase(row){const r=row?.record||{};return (r.status==='offered'&&finiteTime(r.offeredAt))||(['signed','cancelled'].includes(r.status)&&finiteTime(r.signedAt))||cancelledRecovery(row);}
export class ContractError extends Error { constructor(status,message){super(message);this.status=status;} }
const unavailable=()=>new ContractError(503,'Contract access is temporarily unavailable. Please retry.');
const conflict=()=>new ContractError(409,'The contract changed or this action is unavailable. Reload the current record before retrying.');
const digest=v=>createHash('sha256').update(v).digest('hex');
function identifier(v){if(typeof v!=='string'||!UUID.test(v))throw new ContractError(400,'Choose a valid contract or client identifier.');return v.toLowerCase();}
function object(v,keys){if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).some(k=>!keys.includes(k)))throw new ContractError(400,'Invalid contract request fields.');return v;}
function revision(v){if(!Number.isSafeInteger(v)||v<0)throw new ContractError(400,'Reload the current contract revision.');return v;}
function jsonRequest(req){if(!sameOrigin(req))throw new ContractError(403,'Use this website for contract changes.');if(!/^application\/json(?:\s*;|$)/i.test(req.headers?.['content-type']||''))throw new ContractError(415,'Submit a JSON contract request.');if(JSON.stringify(req.body||{}).length>20000)throw new ContractError(413,'Contract request is too large.');}
async function result(q){const {data,error}=await q;if(error)throw unavailable();return data;}
export async function contractCase(db,id){const row=await result(db.from('contract_cases').select('*').eq('id',identifier(id)).maybeSingle());if(!row)throw new ContractError(404,'Contract not found.');return row;}
function key(){const secret=process.env.SUPABASE_SERVICE_ROLE_KEY,project=process.env.VITE_SUPABASE_URL;if(!secret||!project)throw unavailable();return createHmac('sha256',secret).update(AUDIENCE+':'+project).digest();}
const mac=v=>createHmac('sha256',key()).update(v).digest();
const secure=req=>process.env.VERCEL==='1'||req.headers?.['x-forwarded-proto']==='https';
const cookieName=req=>secure(req)?'__Host-hrs_contract':'hrs_local_contract';
function setSignerCookie(req,res,row){const now=Math.floor(Date.now()/1000),p=Buffer.from(JSON.stringify({v:1,aud:AUDIENCE,sub:row.id,gen:row.record.generation,iat:now,exp:now+TTL})).toString('base64url');res.setHeader('Set-Cookie',`${cookieName(req)}=${p}.${mac(p).toString('base64url')}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${TTL}${secure(req)?'; Secure':''}`);}
function clearSignerCookie(req,res){res.setHeader('Set-Cookie',`${cookieName(req)}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure(req)?'; Secure':''}`);}
export async function requireSigner(req,db,expectedCaseId=null){
 const deny=()=>new ContractError(401,'Open a current contract invitation to continue.');
 const token=String(req.headers?.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith(cookieName(req)+'='))?.slice(cookieName(req).length+1);
 if(!token||token.length>2000)throw deny();const parts=token.split('.');if(parts.length!==2||parts.some(s=>!/^[A-Za-z0-9_-]+$/.test(s)))throw deny();
 const sig=Buffer.from(parts[1],'base64url'),want=mac(parts[0]);if(sig.length!==want.length||!timingSafeEqual(sig,want))throw deny();
 let p;try{p=JSON.parse(Buffer.from(parts[0],'base64url').toString());}catch{throw deny();}
 const now=Math.floor(Date.now()/1000);if(p.v!==1||p.aud!==AUDIENCE||!UUID.test(p.sub||'')||!Number.isSafeInteger(p.gen)||!Number.isInteger(p.iat)||!Number.isInteger(p.exp)||p.exp-p.iat!==TTL||p.exp<=now||p.iat>now+60)throw deny();
 // Case intent is separate from cookie authority; reject a switched cookie before reading another case.
 if(expectedCaseId!==null&&p.sub.toLowerCase()!==expectedCaseId)throw deny();
 let row;try{row=await contractCase(db,p.sub);}catch(e){if(e.status===404)throw deny();throw e;}
 if(row.record?.generation!==p.gen||!row.record.inviteUsed||!['offered','signed','cancelled'].includes(row.record.status)||((contractMode()==='prepare'&&!issuedRecoveryCase(row))||(row.record.status==='cancelled'&&row.record.signedAt==null&&!cancelledRecovery(row))))throw deny();return row;
}
export function publicCase(row,signer=false){
 const r=structuredClone(row.record||{});delete r.inviteHash;delete r.inviteExpiresAt;delete r.inviteUsed;delete r.generation;delete r.retainedDocumentIds;
 if(r.packet){delete r.packet.documentPaths;if(signer){delete r.packet.approvalReference;delete r.packet.procedureReference;delete r.packet.stateEligibilityEvidence;}}
 if(signer){const allowed=['status','signerName','clientState','packet','approvedAt','offeredAt','consentAt','servedKinds','copyServedKinds','disclosureReceiptAt','signedAt','signatureName','copyReceiptAt','certificateServedAt','cancellationAt','cancellationReason','paperRequestedAt','withdrawnAt','hold','approvalRevokedAt'];for(const name of Object.keys(r))if(!allowed.includes(name))delete r[name];}
 return {id:row.id,...(!signer?{client_id:row.client_id}:{}),revision:row.revision,record:r,created_at:row.created_at,updated_at:row.updated_at,activation:ACTIVATION,signingEnabled:contractMode()==='sign'&&!cancelledRecovery(row),recoveryOnly:cancelledRecovery(row)};
}
export async function transition(db,{caseId,clientId=null,expectedRevision=null,action,payload={},actorId=null,generation=null}){
 const {data,error}=await db.rpc('contract_transition',{p_case_id:caseId,p_client_id:clientId,p_expected_revision:expectedRevision,p_action:action,p_payload:payload,p_actor_id:actorId,p_generation:generation});
 if(error){if(error.code==='22023')throw new ContractError(400,'Contract details are incomplete or invalid. Check the packet and required evidence.');if(['P0001','23505','23503','23514','40001'].includes(error.code))throw conflict();if(error.code==='42501')throw new ContractError(403,'This contract action is not authorized.');throw unavailable();}
 const row=Array.isArray(data)?data[0]:data;if(!row?.id||!Number.isSafeInteger(row.revision)||!row.record)throw unavailable();return row;
}
function validateActionPayload(action,payload,staff){
 const keys=staff?{create:['signerName','clientState','identityReference'],packet:['version','documents','services','totalFeeCents','duration','durationDays','paymentTerms','eligibleStates','approvalReference','procedureReference','stateEligibilityEvidence','electronicConsentTerms','texas','dateBinding'],approve:[],revoke:[],offer:[],cancellation_review:['reference','notBefore']}:{consent:['accepted','accessConfirmed'],disclosure_receipt:['acknowledged'],sign:['typedName','intent'],copy_receipt:['acknowledged'],cancel:['reason'],paper_request:[],withdraw_consent:[]};
 if(!Object.hasOwn(keys,action))throw new ContractError(400,'Choose an available contract action.');object(payload,keys[action]);
 if(action==='create'&&(typeof payload.signerName!=='string'||payload.signerName.trim().length<2||payload.signerName.length>200||!/^[A-Z]{2}$/.test(payload.clientState||'')||typeof payload.identityReference!=='string'||payload.identityReference.length>1000))throw new ContractError(400,'Enter signer name, state and identity review reference.');
 if(action==='sign'&&(typeof payload.typedName!=='string'||payload.typedName.length>200||payload.intent!==true))throw new ContractError(400,'Enter your name and explicitly confirm your intent to sign.');
 if(action==='consent'&&(payload.accepted!==true||payload.accessConfirmed!==true))throw new ContractError(400,'Affirm electronic-record consent and confirm document access.');
 if(['disclosure_receipt','copy_receipt'].includes(action)&&payload.acknowledged!==true)throw new ContractError(400,'An explicit receipt acknowledgement is required.');
 if(action==='cancel'&&(typeof payload.reason!=='string'||payload.reason.length>1000))throw new ContractError(400,'Use a cancellation reason of up to 1,000 characters.');
 return payload;
}
export function contractEndpoint(kind){return async(req,res)=>{
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
 try{
  const mode=contractMode();
  if(mode==='disabled')throw new ContractError(503,'Online contracts are held while the approved packet and procedures are prepared.');
  if(kind==='staff')return await staffEndpoint(req,res,mode);
  if(kind==='signer')return await signerEndpoint(req,res,mode);
  if(kind==='document')return await documentEndpoint(req,res);
  throw unavailable();
 }catch(e){return res.status(e instanceof ContractError?e.status:503).json({error:e instanceof ContractError?e.message:'Contract access is temporarily unavailable. Please retry.'});}
};}
async function staffEndpoint(req,res,mode){
 if(!['GET','POST'].includes(req.method))throw new ContractError(405,'Method not allowed');const member=await requireAdmin(req,res);if(!member)return;
 const db=serverDb();
 if(req.method==='GET'){
  if(Object.keys(req.query||{}).some(k=>k!=='clientId'))throw new ContractError(400,'Choose a client to view contracts.');const cid=identifier(req.query?.clientId);
  const rows=await result(db.from('contract_cases').select('*').eq('client_id',cid).order('created_at',{ascending:false}).limit(101));
  if(!Array.isArray(rows))throw unavailable();return res.status(200).json({cases:rows.slice(0,100).map(row=>publicCase(row)),truncated:rows.length>100,signingEnabled:mode==='sign'});
 }
 jsonRequest(req);const b=object(req.body,['action','caseId','expectedRevision','clientId','payload']);if(b.action==='activate')throw new ContractError(423,ACTIVATION.reason);
 const payload=validateActionPayload(b.action,b.payload||{},true),create=b.action==='create';const caseId=create?null:identifier(b.caseId),cid=create?identifier(b.clientId):null,rev=create?null:revision(b.expectedRevision);
 if(mode==='prepare'&&b.action==='approve')throw newSigningHold();
 if(mode==='prepare'&&b.action==='offer'){const current=await contractCase(db,caseId);if(!issuedRecoveryCase(current))throw newSigningHold();if(current.revision!==rev)throw conflict();}
 let accessCode;if(b.action==='offer'){accessCode=randomBytes(32).toString('base64url');payload.inviteHash=digest(accessCode);}
 const row=await transition(db,{caseId,clientId:cid,expectedRevision:rev,action:b.action,payload,actorId:member.id});return res.status(create?201:200).json({case:publicCase(row),...(accessCode?{accessCode}:{})});
}
async function signerEndpoint(req,res,mode){
 if(!['GET','POST','DELETE'].includes(req.method))throw new ContractError(405,'Method not allowed');
 const db=serverDb();
 if(req.method==='DELETE'){if(!sameOrigin(req))throw new ContractError(403,'Use this website to sign out.');const q=object(req.query||{},['caseId']);await requireSigner(req,db,identifier(q.caseId));clearSignerCookie(req,res);return res.status(200).json({signedOut:true});}
 if(req.method==='POST'){
  jsonRequest(req);
  if(req.body?.action==='exchange'){
   const b=object(req.body,['action','caseId','accessCode']);const caseId=identifier(b.caseId);
   if(typeof b.accessCode!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(b.accessCode))throw new ContractError(400,'Enter the complete invitation code.');
   const budget=await consumeLoginAttempt(req,caseId,'contract-invite');if(!budget.allowed){res.setHeader('Retry-After',String(budget.retryAfterSeconds));throw new ContractError(429,'Too many invitation attempts. Please retry later.');}
   if(mode==='prepare'){let current;try{current=await contractCase(db,caseId);}catch(e){if(e.status===404)throw conflict();throw e;}if(!issuedRecoveryCase(current))throw conflict();}
   const row=await transition(db,{caseId,action:'exchange',payload:{inviteHash:digest(b.accessCode)}});setSignerCookie(req,res,row);return res.status(200).json({case:publicCase(row,true)});
  }
 }
 let b,expectedCaseId=null;
 if(req.method==='GET'){
  const q=object(req.query||{},['certificate','caseId']);
  if(q.certificate!==undefined&&q.certificate!=='1')throw new ContractError(400,'Invalid contract view.');
  if(q.caseId!==undefined||q.certificate==='1')expectedCaseId=identifier(q.caseId);
 }else{b=object(req.body,['action','caseId','expectedRevision','payload']);expectedCaseId=identifier(b.caseId);}
 const row=await requireSigner(req,db,expectedCaseId);
 if(req.method==='GET'){
  if(req.query?.certificate==='1'){
   const r=row.record;if(!r.signedAt)throw new ContractError(409,'Signature evidence is available after signing.');
   const next=await transition(db,{caseId:row.id,expectedRevision:row.revision,action:'certificate_served',payload:{},generation:r.generation});
   res.setHeader('Content-Type','application/json');res.setHeader('Content-Disposition','attachment; filename="HRS-signature-evidence.json"');
   return res.status(200).json({format:'HRS signature evidence v1',caseId:row.id,revision:next.revision,packetVersion:r.packet.version,documentHashes:r.packet.documentHashes,signerName:r.signerName,signatureName:r.signatureName,signedAt:r.signedAt,consentAt:r.consentAt,disclosureReceiptAt:r.disclosureReceiptAt,copyReceiptAt:r.copyReceiptAt||null,cancellationAt:r.cancellationAt||null,identityCaveat:'Invitation access and typed intent were recorded; independent identity verification is a separate staff procedure.'});
  }
  return res.status(200).json({case:publicCase(row,true)});
 }
 const payload=validateActionPayload(b.action,b.payload||{},false);
 if((mode==='prepare'||cancelledRecovery(row))&&['consent','disclosure_receipt','sign'].includes(b.action))throw newSigningHold();
 const next=await transition(db,{caseId:row.id,expectedRevision:revision(b.expectedRevision),action:b.action,payload,generation:row.record.generation});return res.status(200).json({case:publicCase(next,true)});
}
async function boundedPdf(url,size){
 const ctl=new AbortController();let reader,timer;const timeout=new Promise((_,reject)=>{timer=setTimeout(()=>{ctl.abort();reject(unavailable());},15000);});
 const run=(async()=>{
  const response=await fetch(url,{signal:ctl.signal,redirect:'error'});if(!response.ok||!response.body?.getReader)throw unavailable();
  const raw=response.headers.get('content-length');if(raw!==null&&(!/^\d+$/.test(raw)||Number(raw)!==size))throw new ContractError(422,'The packet file changed. Staff review is required.');
  reader=response.body.getReader();let total=0;const parts=[];
  while(true){const {done,value}=await reader.read();if(done)break;total+=value.byteLength;if(total>MAX_DOCUMENT_BYTES||total>size)throw new ContractError(422,'The packet file exceeds its verified size.');parts.push(Buffer.from(value));}
  const bytes=Buffer.concat(parts);if(total!==size||bytes.subarray(0,5).toString()!=='%PDF-')throw new ContractError(422,'The packet file could not be verified.');return bytes;
 })();
 try{return await Promise.race([run,timeout]);}finally{clearTimeout(timer);ctl.abort();if(reader)Promise.resolve(reader.cancel()).catch(()=>{});}
}
async function documentEndpoint(req,res){
 if(req.method!=='POST')throw new ContractError(405,'Method not allowed');jsonRequest(req);const b=object(req.body,['kind','caseId']);if(!KINDS.includes(b.kind))throw new ContractError(400,'Choose a packet document.');
 const db=serverDb(),row=await requireSigner(req,db,identifier(b.caseId)),r=row.record;
 // SQL repeats these gates atomically when recording the transfer.
 if(!r.signedAt&&!cancelledRecovery(row)&&b.kind!=='consent'&&(!r.consentAt||(b.kind!=='disclosure'&&!r.disclosureReceiptAt)))throw conflict();
 const packet=r.packet||{},did=identifier(packet.documents?.[b.kind]),hash=packet.documentHashes?.[b.kind];if(!/^[a-f0-9]{64}$/.test(hash||''))throw conflict();
 const doc=await result(db.from('documents').select('id,client_id,file_path,file_size,name').eq('id',did).eq('client_id',row.client_id).maybeSingle());
 const op=await result(db.from('document_operations').select('id,client_id,state,final_path,verified_sha256,verified_size,verified_mime').eq('id',did).eq('client_id',row.client_id).maybeSingle());
 if(!doc)throw new ContractError(404,'Packet document not found.');
 if(!safeDocumentPath(doc.file_path,row.client_id)||packet.documentPaths?.[b.kind]!==doc.file_path||!op||op.state!=='ready'||op.final_path!==doc.file_path||op.verified_sha256!==hash||op.verified_mime!=='application/pdf'||!Number.isInteger(Number(op.verified_size))||Number(op.verified_size)<1||Number(op.verified_size)>MAX_DOCUMENT_BYTES||Number(doc.file_size)!==Number(op.verified_size))throw conflict();
 const duplicates=await result(db.from('documents').select('id').eq('file_path',doc.file_path).limit(2));if(duplicates.length!==1||duplicates[0].id!==did)throw conflict();
 const storage=db.storage.from(DOCUMENT_BUCKET),info=await storage.info(doc.file_path);if(info.error||!info.data)throw unavailable();const size=info.data.size??info.data.metadata?.size,type=info.data.contentType??info.data.metadata?.mimetype;
 if(size!==Number(op.verified_size)||size>MAX_DOCUMENT_BYTES||type!=='application/pdf')throw new ContractError(422,'The packet file changed. Staff review is required.');
 const signed=await storage.createSignedUrl(doc.file_path,30,{download:true});if(signed.error||!signed.data?.signedUrl)throw unavailable();
 let url;try{url=new URL(signed.data.signedUrl);const expected=new URL(process.env.VITE_SUPABASE_URL);if(url.origin!==expected.origin||!url.pathname.startsWith('/storage/v1/object/sign/'))throw Error();}catch{throw unavailable();}
 const bytes=await boundedPdf(url.href,size);if(digest(bytes)!==hash)throw new ContractError(409,'The packet fingerprint changed. Staff review is required.');
 await transition(db,{caseId:row.id,expectedRevision:row.revision,action:'document_served',payload:{kind:b.kind},generation:r.generation});
 res.setHeader('Content-Type','application/pdf');res.setHeader('Content-Disposition',`attachment; filename="HRS-${b.kind}.pdf"`);res.setHeader('Content-Length',String(bytes.length));return res.status(200).send(bytes);
}
