import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { requireAdmin, sameOrigin } from './portal-session.js';
import { serverDb } from './server-db.js';

export const DOCUMENT_BUCKET = 'home-ready-client-documents';
export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
const MIME_EXT = {'application/pdf':'pdf','image/jpeg':'jpg','image/png':'png'};
const DOC_TYPES = ['other','id_doc','credit_report','dispute_letter'];
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const TICKET_CONTEXT = 'home-ready-scores:home_ready:document-upload:v1';
const FIELDS = 'id,client_id,type,name,file_path,file_size,created_at';
export class DocumentError extends Error {
  constructor(status,message,code) { super(message);this.status=status;this.code=code; }
}
const unavailable=()=>new DocumentError(503,'Document access is temporarily unavailable. Please retry.');
function id(value) { if(typeof value!=='string'||!UUID.test(value))throw new DocumentError(400,'A valid client or document identifier is required.');return value.toLowerCase(); }
function mime(value) { if(typeof value!=='string')return null;const m=value.split(';')[0].trim().toLowerCase();return m==='image/jpg'?'image/jpeg':Object.hasOwn(MIME_EXT,m)?m:null; }
function body(req,allowed) { if(!req.body||typeof req.body!=='object'||Array.isArray(req.body)||Object.keys(req.body).some(k=>!allowed.includes(k)))throw new DocumentError(400,'Invalid document request fields.');return req.body; }
export function safeDocumentPath(path,clientId) { return typeof path==='string'&&!path.includes('..')&&new RegExp('^'+clientId+'/[A-Za-z0-9][A-Za-z0-9._-]{0,199}$').test(path); }
export function publicDocument(row) { return {id:row.id,name:row.name,type:row.type,file_size:row.file_size??null,created_at:row.created_at??null}; }
async function query(result) { const {data,error}=await result;if(error)throw unavailable();return data; }
async function clientExists(db,cid) { if(!await query(db.from('clients').select('id').eq('id',cid).maybeSingle()))throw new DocumentError(404,'Client not found.'); }
const operation=(db,oid,cid)=>query(db.from('document_operations').select('*').eq('id',oid).eq('client_id',cid).maybeSingle());
const document=(db,did,cid)=>query(db.from('documents').select(FIELDS).eq('id',did).eq('client_id',cid).maybeSingle());
const blockedState=op=>op&&op.state!=='ready';
async function uniquePath(db,path,expectedId) {
  const rows=await query(db.from('documents').select('id').eq('file_path',path).limit(2));
  if(rows.length>1||(expectedId&&rows.some(r=>r.id!==expectedId)))throw new DocumentError(409,'Multiple document records share this file path. Administrator review is required.','DOCUMENT_PATH_AMBIGUOUS');
}
function ticketMac(value) {
  const secret=process.env.SUPABASE_SERVICE_ROLE_KEY,project=process.env.VITE_SUPABASE_URL;
  if(!secret||!project)throw unavailable();
  const key=createHmac('sha256',secret).update(TICKET_CONTEXT+':'+project).digest();
  return createHmac('sha256',key).update(value).digest();
}
function makeTicket(op) {
  const iat=Math.floor(Date.now()/1000);
  const p=Buffer.from(JSON.stringify({v:1,aud:TICKET_CONTEXT,op:op.id,cid:op.client_id,uid:op.operator_id,iat,exp:iat+300})).toString('base64url');
  return p+'.'+ticketMac(p).toString('base64url');
}
function readTicket(value,cid,member) {
  const invalid=()=>new DocumentError(403,'This upload ticket is invalid for the current administrator.','UPLOAD_TICKET_INVALID');
  if(typeof value!=='string'||value.length>2000)throw invalid();
  const parts=value.split('.');
  if(parts.length!==2||!parts.every(x=>/^[A-Za-z0-9_-]+$/.test(x)))throw invalid();
  const signature=Buffer.from(parts[1],'base64url'),expected=ticketMac(parts[0]);
  if(signature.length!==expected.length||!timingSafeEqual(signature,expected))throw invalid();
  let p;try{p=JSON.parse(Buffer.from(parts[0],'base64url').toString());}catch{throw invalid();}
  const now=Math.floor(Date.now()/1000);
  if(p.v!==1||p.aud!==TICKET_CONTEXT||!UUID.test(p.op||'')||p.cid!==cid||p.uid!==member.id||!Number.isInteger(p.iat)||!Number.isInteger(p.exp)||p.exp-p.iat!==300||p.iat>now+60)throw invalid();
  return {operationId:p.op,expired:p.exp<=now};
}
function checkUploadOperation(op,cid,member) {
  const ext=MIME_EXT[op?.declared_mime];
  if(!op||op.client_id!==cid||op.operator_id!==member.id||!UUID.test(op.id)||!ext||op.staging_path!=='_staging/'+cid+'/'+op.id+'.'+ext||op.final_path!==cid+'/'+op.id+'.'+ext)throw new DocumentError(403,'Upload operation is not available to this administrator.');
}
export function documentEndpoint(method,action) {
  return async function handler(req,res) {
    res.setHeader('Cache-Control','no-store');
    if(req.method!==method)return res.status(405).json({error:'Method not allowed'});
    const member=await requireAdmin(req,res);if(!member)return;
    try {
      if(method!=='GET'){
        if(!sameOrigin(req))throw new DocumentError(403,'Use the team portal for document changes.');
        const type=req.headers?.['content-type'];
        if(typeof type!=='string'||!/^application\/json(?:\s*;|$)/i.test(type.trim()))throw new DocumentError(415,'Submit a JSON document request.');
      }
      const db=serverDb();return await action(req,res,{db,member,storage:db.storage.from(DOCUMENT_BUCKET)});
    }catch(error){
      const known=error instanceof DocumentError;
      return res.status(known?error.status:503).json({error:known?error.message:'Document access is temporarily unavailable. Please retry.',...(known&&error.code?{code:error.code}:{})});
    }
  };
}
export async function listDocuments(req,res,{db}) {
  const cid=id(req.query?.clientId),raw=req.query?.page??'0';
  if(typeof raw!=='string'||!/^\d{1,7}$/.test(raw))throw new DocumentError(400,'Choose a valid document page.');
  const page=Number(raw),pageSize=50;await clientExists(db,cid);
  const {data:rows,error,count}=await db.from('documents').select(FIELDS,{count:'exact'}).eq('client_id',cid).order('created_at',{ascending:false}).order('id',{ascending:false}).range(page*pageSize,page*pageSize+pageSize-1);
  if(error||!Array.isArray(rows)||!Number.isInteger(count))throw unavailable();
  const ids=rows.map(r=>r.id);
  const ops=ids.length?await query(db.from('document_operations').select('id,state,verified_mime,verified_sha256').eq('client_id',cid).in('id',ids)):[];
  const states=new Map((ops||[]).map(o=>[o.id,o]));
  const documents=await Promise.all(rows.map(async row=>{
    const safe=safeDocumentPath(row.file_path,cid);let ambiguous=false;
    if(safe)try{await uniquePath(db,row.file_path,row.id);}catch(e){if(e.code!=='DOCUMENT_PATH_AMBIGUOUS')throw e;ambiguous=true;}
    const available=safe&&!ambiguous&&!blockedState(states.get(row.id));
    const proof=states.get(row.id);const shaReady=proof?.state==='ready'&&/^[a-f0-9]{64}$/.test(proof.verified_sha256||'');
    return {...publicDocument(row),available,verifiedMime:proof?.verified_mime??null,shaReady,packetEligible:available&&shaReady&&proof.verified_mime==='application/pdf',...(!available?{unavailableReason:!safe?'This record has no verified private file path.':ambiguous?'Multiple records share this file path; administrator review is required.':'Deletion or verification is pending. Retry the document action.'}:{})};
  }));
  return res.status(200).json({documents,page,pageSize,total:count});
}
export async function issueUpload(req,res,{db,member,storage}) {
  const b=body(req,['clientId','fileName','fileType','fileSize','docType']),cid=id(b.clientId),type=mime(b.fileType),docType=b.docType??'other';
  if(typeof b.fileName!=='string'||!b.fileName.trim()||b.fileName.length>200||/[/\\]/.test(b.fileName)||Array.from(b.fileName).some(x=>x.charCodeAt(0)<32||x.charCodeAt(0)===127)||!type||!Number.isInteger(b.fileSize)||b.fileSize<1||b.fileSize>MAX_DOCUMENT_BYTES||!DOC_TYPES.includes(docType))throw new DocumentError(400,'Choose a PDF, JPG or PNG up to 10 MiB with a valid name and document type.');
  await clientExists(db,cid);
  const oid=randomUUID(),ext=MIME_EXT[type],now=Date.now();
  const op={id:oid,client_id:cid,operator_id:member.id,name:b.fileName.trim(),doc_type:docType,declared_mime:type,declared_size:b.fileSize,staging_path:'_staging/'+cid+'/'+oid+'.'+ext,final_path:cid+'/'+oid+'.'+ext,state:'pending',ticket_expires_at:new Date(now+300000).toISOString(),provider_expires_at:new Date(now+7200000).toISOString(),cleanup_after:new Date(now+7260000).toISOString(),cleanup_pending:true};
  await query(db.from('document_operations').insert(op).select('id').single());
  const {data,error}=await storage.createSignedUploadUrl(op.staging_path,{upsert:false});
  if(error||!data?.signedUrl)throw unavailable();
  // Start the conservative cleanup horizon after signing; never assume a slow
  // provider response shortened the native capability's lifetime.
  const signedAt=Date.now();
  await query(db.from('document_operations').update({ticket_expires_at:new Date(signedAt+300000).toISOString(),provider_expires_at:new Date(signedAt+7200000).toISOString(),cleanup_after:new Date(signedAt+7260000).toISOString()}).eq('id',oid).eq('state','pending').select('id').single());
  return res.status(201).json({uploadUrl:data.signedUrl,uploadTicket:makeTicket(op),operationId:oid,uploadExpiresIn:7200,finalizeExpiresIn:300});
}
function missing(error) { return Number(error?.status??error?.statusCode)===404||error?.code==='NoSuchKey'; }
async function objectInfo(storage,path) {
  const {data,error}=await storage.info(path);
  if(error){if(missing(error))return null;throw unavailable();}
  if(!data)throw unavailable();
  const size=data.size??data.metadata?.size,type=mime(data.contentType??data.metadata?.mimetype);
  if(!Number.isInteger(size)||!type)throw unavailable();
  if(size<1||size>MAX_DOCUMENT_BYTES)throw new DocumentError(422,'The stored file exceeds the permitted document size.','UPLOAD_INVALID');
  return {size,mime:type};
}
function sniff(bytes) {
  if(bytes.subarray(0,5).toString('ascii')==='%PDF-')return 'application/pdf';
  if(bytes.length>=3&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return 'image/jpeg';
  if(bytes.length>=8&&bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return 'image/png';
  return null;
}
async function verifiedObject(storage,path,op) {
  const info=await objectInfo(storage,path);if(!info)return null;
  if(info.size!==Number(op.declared_size)||info.mime!==op.declared_mime)throw new DocumentError(422,'The uploaded file does not match the selected file.','UPLOAD_INVALID');
  const bytes=await readBoundedObject(path,info.size);
  if(bytes.length!==info.size||bytes.length>MAX_DOCUMENT_BYTES||sniff(bytes)!==info.mime)throw new DocumentError(422,'File contents must match PDF, JPG or PNG format.','UPLOAD_INVALID');
  return {bytes,size:bytes.length,mime:info.mime,sha256:createHash('sha256').update(bytes).digest('hex')};
}
async function readBoundedObject(path,expectedSize) {
  // Fixed provider route and server credential only. Never follow stored or
  // browser-provided URLs; redirects cannot forward credentials elsewhere.
  const project=process.env.VITE_SUPABASE_URL,secret=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!project||!secret)throw unavailable();
  const url=new URL('/storage/v1/object/'+DOCUMENT_BUCKET+'/'+path.split('/').map(encodeURIComponent).join('/'),project);
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
  let reader;
  try {
    const response=await fetch(url.toString(),{method:'GET',headers:{Authorization:'Bearer '+secret,apikey:secret},cache:'no-store',redirect:'error',signal:controller.signal});
    if(!response.ok||!response.body?.getReader)throw unavailable();
    reader=response.body.getReader();
    const length=response.headers.get('content-length');
    if(length!==null&&(!/^\d+$/.test(length)||Number(length)!==expectedSize))throw new DocumentError(422,'Stored file length does not match verified metadata.','UPLOAD_INVALID');
    const chunks=[];let total=0;
    while(true){
      const {done,value}=await reader.read();if(done)break;
      total+=value.byteLength;
      if(total>expectedSize||total>MAX_DOCUMENT_BYTES)throw new DocumentError(422,'Stored file exceeds its verified size.','UPLOAD_INVALID');
      chunks.push(Buffer.from(value));
    }
    if(total!==expectedSize)throw new DocumentError(422,'Stored file length does not match verified metadata.','UPLOAD_INVALID');
    return Buffer.concat(chunks,total);
  }finally{
    clearTimeout(timer);controller.abort();
    if(reader){try{await reader.cancel();}catch{/* Provider may already have ended the stream. */}reader.releaseLock();}
  }
}
async function recordCleanup(db,op,pending) {
  try{const {data,error}=await db.from('document_operations').update({cleanup_pending:pending,updated_at:new Date(Date.now()).toISOString()}).eq('id',op.id).eq('state',op.state).select('id').maybeSingle();return Boolean(error||!data);}catch{return true;}
}
async function cleanup(db,storage,op,includeFinal=false) {
  let pending=true;
  try{const keys=[op.staging_path,...(includeFinal?[op.final_path]:[])].filter(Boolean);const {error}=await storage.remove(keys);pending=Boolean(error);}catch{pending=true;}
  const replayPossible=Boolean(op.staging_path&&(!op.cleanup_after||Date.parse(op.cleanup_after)>Date.now()));
  return (await recordCleanup(db,op,pending||replayPossible))||pending;
}
async function readyDocument(db,op) {
  const row=await document(db,op.id,op.client_id);
  if(!row||row.file_path!==op.final_path||row.file_size===null||Number(row.file_size)!==Number(op.verified_size))throw unavailable();
  return row;
}
async function readyResponse(res,db,storage,op,row) {
  const cleanupPending=await cleanup(db,storage,op);
  return res.status(200).json({document:publicDocument(row),cleanupPending});
}
export async function completeUpload(req,res,{db,member,storage}) {
  const b=body(req,['clientId','uploadTicket']),cid=id(b.clientId),ticket=readTicket(b.uploadTicket,cid,member);
  await clientExists(db,cid);
  let op=await operation(db,ticket.operationId,cid);checkUploadOperation(op,cid,member);
  if(op.state==='ready')return readyResponse(res,db,storage,op,await readyDocument(db,op));
  if(op.state!=='pending')throw new DocumentError(409,'This document was deleted or is being deleted.','DOCUMENT_DELETING');
  if(ticket.expired||Date.parse(op.ticket_expires_at)<=Date.now())throw new DocumentError(410,'The finalization ticket expired. Renew this upload to retry.','UPLOAD_TICKET_EXPIRED');
  let verified=await verifiedObject(storage,op.staging_path,op);
  if(!verified)verified=await verifiedObject(storage,op.final_path,op);
  if(!verified){
    if(Date.parse(op.provider_expires_at)<=Date.now())throw new DocumentError(410,'The upload capability expired and no file reached storage. Select the file again.','UPLOAD_ACCESS_EXPIRED');
    throw new DocumentError(404,'The upload has not reached storage. Retry uploading the selected file.','UPLOAD_MISSING');
  }
  const put=await storage.upload(op.final_path,verified.bytes,{upsert:false,contentType:verified.mime,cacheControl:'0'});
  if(put.error){
    if(Number(put.error.status??put.error.statusCode)!==409)throw unavailable();
    let existing;try{existing=await verifiedObject(storage,op.final_path,op);}catch{throw new DocumentError(409,'The existing final object could not be verified. Start a new upload.','FINAL_OBJECT_CONFLICT');}
    if(!existing||existing.sha256!==verified.sha256)throw new DocumentError(409,'A different object already occupies the final document key.','FINAL_OBJECT_CONFLICT');
  }
  const final=await verifiedObject(storage,op.final_path,op);
  if(!final||final.sha256!==verified.sha256)throw unavailable();
  const result=await db.rpc('commit_document_upload',{p_operation_id:op.id,p_operator_id:member.id,p_size:verified.size,p_mime:verified.mime,p_sha256:verified.sha256});
  // Resolve even a lost commit response from authoritative state; never remove a
  // possibly committed file merely because the HTTP/RPC response was uncertain.
  op=await operation(db,op.id,cid);checkUploadOperation(op,cid,member);
  if(['deleting','deleted'].includes(op.state)){
    await cleanup(db,storage,op,true);
    throw new DocumentError(409,'Deletion won the upload race. No document was recreated.','DOCUMENT_DELETING');
  }
  if(op.state!=='ready'||op.verified_sha256!==verified.sha256||Number(op.verified_size)!==verified.size||op.verified_mime!==verified.mime)throw unavailable();
  if(!result.error&&!result.data?.document)throw unavailable();
  return readyResponse(res,db,storage,op,await readyDocument(db,op));
}
export async function downloadDocument(req,res,{db,storage}) {
  const b=body(req,['clientId','documentId']),cid=id(b.clientId),did=id(b.documentId);
  await clientExists(db,cid);
  const row=await document(db,did,cid);if(!row)throw new DocumentError(404,'Document not found.');
  if(!safeDocumentPath(row.file_path,cid))throw new DocumentError(409,'This record has no verified private file path.');
  await uniquePath(db,row.file_path,row.id);
  if(blockedState(await operation(db,did,cid)))throw new DocumentError(409,'Document deletion or verification is pending.');
  const {data,error}=await storage.createSignedUrl(row.file_path,300,{download:true});
  if(error||!data?.signedUrl)throw unavailable();
  if(blockedState(await operation(db,did,cid)))throw new DocumentError(409,'Document deletion or verification is pending.');
  return res.status(200).json({signedUrl:data.signedUrl,expiresIn:300});
}
export async function deleteDocument(req,res,context) {
  const b=body(req,['clientId','documentId']),cid=id(b.clientId),did=id(b.documentId);
  await removeDocument(context,cid,did);
  return res.status(200).json({deleted:true});
}
async function removeDocument({db,member,storage},cid,did,pendingOnly=false) {
  const row=await document(db,did,cid),op=await operation(db,did,cid);
  // Retained exact ledger bindings remain cleanup authority after a client was
  // deleted. They grant no unrelated-client or browser access.
  if(!op)await clientExists(db,cid);
  if(!row&&!op)throw new DocumentError(404,'Document not found.');
  if((row&&!safeDocumentPath(row.file_path,cid))||(op&&!safeDocumentPath(op.final_path,cid))||(row&&op&&row.file_path!==op.final_path))throw new DocumentError(409,'This document has no verified private file path.');
  await uniquePath(db,row?.file_path||op.final_path,did);
  const begin=await db.rpc('begin_document_delete',{p_document_id:did,p_client_id:cid,p_operator_id:member.id,...(pendingOnly?{p_pending_only:true}:{})});
  if(begin.error?.code==='P0001'&&begin.error?.message==='Contract document retained')throw new DocumentError(409,'This is a retained contract document and cannot be deleted.');
  if(!begin.error&&begin.data?.state==='deferred'&&pendingOnly)return false;
  if(begin.error||!begin.data||!['deleting','deleted'].includes(begin.data.state))throw unavailable();
  const path=begin.data.file_path,staging=begin.data.staging_path;
  if(!safeDocumentPath(path,cid)||(staging&&!new RegExp('^_staging/'+cid+'/'+did+'\\.(pdf|jpg|png)$').test(staging)))throw unavailable();
  // Already-deleted retries still remove retained keys: an uncertain in-flight
  // server write may have left a private final object after the original remove.
  const removed=await storage.remove([path,...(staging?[staging]:[])]);
  if(removed.error)throw new DocumentError(503,'The file could not be confirmed removed. Deletion remains pending; retry deletion.');
  const done=await db.rpc('complete_document_delete',{p_document_id:did,p_client_id:cid,p_operator_id:member.id});
  if(done.error||done.data?.deleted!==true)throw new DocumentError(503,'File removal completed but record cleanup is unconfirmed. Retry deletion.');
  const terminal=await operation(db,did,cid);
  const replayPossible=Boolean(terminal?.staging_path&&(!terminal.cleanup_after||Date.parse(terminal.cleanup_after)>Date.now()));
  if(!terminal||await recordCleanup(db,terminal,replayPossible))throw new DocumentError(503,'File removal completed but cleanup tracking is unconfirmed. Retry deletion.');
  return true;
}
export async function renewUpload(req,res,{db,member,storage}) {
  const b=body(req,['clientId','operationId']),cid=id(b.clientId),oid=id(b.operationId);
  await clientExists(db,cid);
  const op=await operation(db,oid,cid);checkUploadOperation(op,cid,member);
  if(!['pending','ready'].includes(op.state))throw new DocumentError(409,'This document was deleted or is being deleted.','DOCUMENT_DELETING');
  if(op.state==='pending'&&Date.parse(op.provider_expires_at)<=Date.now()){
    // An expired native capability does not discard an uncertain successful PUT
    // or a final object left by a failed metadata commit.
    const stage=await objectInfo(storage,op.staging_path),final=stage?null:await objectInfo(storage,op.final_path);
    if(!stage&&!final)throw new DocumentError(410,'The upload capability expired and no file reached storage. Select the file again.','UPLOAD_ACCESS_EXPIRED');
  }
  const {data,error}=await db.rpc('renew_document_upload',{p_operation_id:oid,p_client_id:cid,p_operator_id:member.id});
  if(error||!data?.operation)throw unavailable();
  checkUploadOperation(data.operation,cid,member);
  if(!['pending','ready'].includes(data.operation.state))throw unavailable();
  return res.status(200).json({uploadTicket:makeTicket(data.operation),operationId:oid,finalizeExpiresIn:300});
}
export async function cleanupDocuments(req,res,{db,member,storage}) {
  const b=body(req,['clientId']),cid=id(b.clientId);
  const retained=await query(db.from('document_operations').select('id').eq('client_id',cid).limit(1));
  if(!retained.length)await clientExists(db,cid);
  // Ready/deleted bindings are retained reconciliation candidates forever.
  // A native or server PUT may complete after its HTTP response/ticket/expiry;
  // an earlier successful remove never proves that no late write can arrive.
  const now=new Date(Date.now()).toISOString();
  const [terminal,noHorizon,pending,waiting,liveTickets]=await Promise.all([
    db.from('document_operations').select('*',{count:'exact'}).eq('client_id',cid).in('state',['ready','deleting','deleted']).lte('cleanup_after',now).order('updated_at',{ascending:true}).order('id',{ascending:true}).limit(20),
    db.from('document_operations').select('*',{count:'exact'}).eq('client_id',cid).in('state',['ready','deleting','deleted']).is('cleanup_after',null).order('updated_at',{ascending:true}).order('id',{ascending:true}).limit(20),
    db.from('document_operations').select('*',{count:'exact'}).eq('client_id',cid).eq('cleanup_pending',true).eq('state','pending').lte('cleanup_after',now).lte('ticket_expires_at',now).order('updated_at',{ascending:true}).order('id',{ascending:true}).limit(20),
    db.from('document_operations').select('id',{count:'exact',head:true}).eq('client_id',cid).in('state',['pending','ready','deleting','deleted']).gt('cleanup_after',now),
    db.from('document_operations').select('id',{count:'exact',head:true}).eq('client_id',cid).eq('cleanup_pending',true).eq('state','pending').lte('cleanup_after',now).gt('ticket_expires_at',now),
  ]);
  if([terminal,noHorizon,pending,waiting,liveTickets].some(r=>r.error||!Number.isInteger(r.count))||!Array.isArray(terminal.data)||!Array.isArray(noHorizon.data)||!Array.isArray(pending.data))throw unavailable();
  const ops=[...terminal.data,...noHorizon.data,...pending.data].sort((a,b)=>String(a.updated_at??'').localeCompare(String(b.updated_at??''))||a.id.localeCompare(b.id)).slice(0,20);
  let cleaned=0,failed=0,deferred=waiting.count+liveTickets.count+terminal.count+noHorizon.count+pending.count-ops.length;
  for(const op of ops){
    let outcome='failed';
    try{
      if(op.state!=='ready'){
        outcome=await removeDocument({db,member,storage},cid,op.id,op.state==='pending')?'cleaned':'deferred';
      }else{
        if(op.staging_path&&(!UUID.test(op.id)||op.staging_path!=='_staging/'+cid+'/'+op.id+'.'+MIME_EXT[op.declared_mime]))throw unavailable();
        outcome=await cleanup(db,storage,op)?'failed':'cleaned';
      }
    }catch{/* Retained keys remain retryable; rotate this failed check as well. */}
    try{
      const latest=await operation(db,op.id,cid);
      if(!latest)throw unavailable();
      const touched=await db.from('document_operations').update({updated_at:new Date(Date.now()).toISOString()}).eq('id',op.id).eq('state',latest.state).select('id').maybeSingle();
      if(touched.error||!touched.data)throw unavailable();
    }catch{outcome='failed';}
    if(outcome==='cleaned')cleaned++;else if(outcome==='deferred')deferred++;else failed++;
  }
  // "checked" concerns this bounded pass; tombstones are never purged or
  // permanently removed from reconciliation merely because removal succeeded.
  return res.status(200).json({processed:ops.length,checked:cleaned,cleaned,deferred,failed});
}
