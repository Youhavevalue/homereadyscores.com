import { requireAdmin, sameOrigin } from './_lib/portal-session.js';
import { serverDb } from './_lib/server-db.js';
const STATES=['pending_manual_review','contact_scheduled','agreement_hold','secure_intake_pending','closed'];
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FIELDS='id,first_name,last_name,email,phone,goal,plan,status,created_at,updated_at,assigned_to,next_action,next_action_at,review_notes,attribution';
const PAGE_SIZE=50;
const validWindow=(value,now)=>typeof value==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString()===value&&value<=now;
// Include an unrecorded status in open work so it cannot disappear from intake.
const openWork=read=>read.or('status.neq.closed,status.is.null');
async function overview(db,since,checkedAt){
 const count=()=>openWork(db.from('enrollments').select('id',{count:'exact',head:true}).eq('enrollment_source','website_manual'));
 const results=await Promise.all([count(),count().is('next_action_at',null),count().lte('next_action_at',checkedAt),count().gt('created_at',since).lte('created_at',checkedAt)]);
 if(results.some(r=>r.error||!Number.isSafeInteger(r.count)||r.count<0))throw Error('Attention counts unavailable');
 return {since,checkedAt,consistency:'separate_reads',counts:Object.fromEntries(['open','unscheduled','overdue','newSince'].map((key,i)=>[key,results[i].count]))};
}
export default async function handler(req,res) {
 if(!['GET','PATCH'].includes(req.method))return res.status(405).json({error:'Method not allowed'});
 if(req.method==='PATCH'&&!sameOrigin(req))return res.status(403).json({error:'Use the team portal to update a request.'});
 const member=await requireAdmin(req,res);if(!member)return;
 try {
  const db=serverDb();
  if(req.method==='GET') {
   const query=req.query||{};
   if(query.overview!==undefined){
    const checkedAt=new Date().toISOString();
    if(query.overview!=='1'||Object.keys(query).some(k=>!['overview','since'].includes(k))||!validWindow(query.since,checkedAt))return res.status(400).json({error:'Reload the queue to start a valid arrival check.'});
    return res.status(200).json(await overview(db,query.since,checkedAt));
   }
   if(query.historyFor!==undefined) {
    if(typeof query.historyFor!=='string'||!UUID.test(query.historyFor))return res.status(400).json({error:'Select a valid request history.'});
    const found=await db.from('enrollments').select('id').eq('id',query.historyFor).eq('enrollment_source','website_manual').maybeSingle();
    if(found.error)return res.status(503).json({error:'Request history unavailable.'});
    if(!found.data)return res.status(404).json({error:'Request not found.'});
    const history=await db.from('activity_log').select('id,action,actor_type,actor_id,metadata,created_at').eq('entity_type','enrollment').eq('entity_id',query.historyFor).order('created_at',{ascending:false}).limit(51);
    if(history.error)return res.status(503).json({error:'Request history unavailable.'});
    return res.status(200).json({history:(history.data||[]).slice(0,50),hasMore:(history.data||[]).length>50});
   }
   const rawPage=query.page===undefined?'1':query.page;
   const search=query.search===undefined?'':query.search;
   const status=query.status===undefined?'':query.status;
   const owner=query.owner===undefined?'':query.owner;
   const action=query.action===undefined?'':query.action;
   const receivedAfter=query.receivedAfter===undefined?'':query.receivedAfter;
   if(receivedAfter!==''&&!validWindow(receivedAfter,new Date().toISOString()))return res.status(400).json({error:'Use a valid inquiry arrival window.'});
   if(typeof rawPage!=='string'||!/^\d{1,7}$/.test(rawPage)||Number(rawPage)<1||Number(rawPage)>1000000||typeof search!=='string'||search.length>100||!/^[\p{L}\p{N}@.'+ _-]*$/u.test(search)||typeof status!=='string'||!['','open',...STATES].includes(status)||typeof owner!=='string'||owner.length>100||typeof action!=='string'||!['','overdue','unscheduled'].includes(action))return res.status(400).json({error:'Use a valid page, search and request filters.'});
   const page=Number(rawPage),term=search.trim();
   let read=db.from('enrollments').select(FIELDS,{count:'exact'}).eq('enrollment_source','website_manual');
   if(UUID.test(term))read=read.eq('id',term);
   else if(term){const escaped=term.replaceAll('_','\\_');read=read.or(['first_name','last_name','email','phone'].map(key=>`${key}.ilike.%${escaped}%`).join(','));}
   if(status&&status!=='open')read=read.eq('status',status);
   if(status==='open'||action)read=openWork(read);
   if(receivedAfter)read=read.gt('created_at',receivedAfter);
   if(owner)read=read.eq('assigned_to',owner);
   const readStartedAt=new Date().toISOString();
   if(action==='overdue')read=read.lte('next_action_at',readStartedAt);
   if(action==='unscheduled')read=read.is('next_action_at',null);
   if(status==='open'||action)read=read.order('next_action_at',{ascending:true,nullsFirst:true}).order('created_at',{ascending:true}).order('id',{ascending:true});
   else read=read.order('created_at',{ascending:false}).order('id',{ascending:false});
   const {data,error,count}=await read.range((page-1)*PAGE_SIZE,page*PAGE_SIZE-1);
   if(error||!Number.isInteger(count))return res.status(503).json({error:'Request queue unavailable. No empty-queue result has been assumed.'});
   return res.status(200).json({requests:data||[],page,pageSize:PAGE_SIZE,total:count,hasMore:page*PAGE_SIZE<count,statuses:STATES,readStartedAt});
  }
  const b=req.body;
  if(!b||!UUID.test(b.id||'')||typeof b.expectedUpdatedAt!=='string'||!Number.isFinite(Date.parse(b.expectedUpdatedAt))||!STATES.includes(b.status))return res.status(400).json({error:'A valid request, current revision and review status are required.'});
  if(typeof b.assignedTo!=='string'||!b.assignedTo.trim()||b.assignedTo.length>100||typeof b.nextAction!=='string'||!b.nextAction.trim()||b.nextAction.length>300||typeof b.reviewNotes!=='string'||b.reviewNotes.length>1000||typeof b.nextActionAt!=='string'||!Number.isFinite(Date.parse(b.nextActionAt)))return res.status(400).json({error:'Owner, next action and date are required. Keep notes under 1,000 characters.'});
  const {data,error}=await db.rpc('review_website_inquiry',{p_id:b.id,p_revision:b.expectedUpdatedAt,p_review:{status:b.status,assigned_to:b.assignedTo.trim(),next_action:b.nextAction.trim(),next_action_at:new Date(b.nextActionAt).toISOString(),review_notes:b.reviewNotes.trim()},p_actor:member.id});
  if(error?.code==='PT409'||error?.code==='40001')return res.status(409).json({error:'This request changed. Reload the queue before saving again.'});
  if(error?.code==='42501')return res.status(403).json({error:'An authorized administrator is required.'});
  if(error||!data?.id)return res.status(503).json({error:'Update could not be saved. Your draft is still available.'});
  return res.status(200).json({success:true,request:data});
 }catch{return res.status(503).json({error:'Request handling is temporarily unavailable. Please retry.'});}
}
