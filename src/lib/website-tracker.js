import { captureAttribution, validateAttribution, validPublicEvent, UUID } from '../../shared/website-tracking.js';
const CONTEXT='hrs.website.context.v1',PENDING='hrs.website.pending.v1';
export function createWebsiteTracker(env) {
 let memory=null,pending=null,traffic=null;const sent=new Set();
 const privacy=()=>env.navigator?.globalPrivacyControl===true || ['1','yes'].includes(String(env.navigator?.doNotTrack||'').toLowerCase());
 const now=()=>env.now ? env.now() : Date.now();
 const read=key=>{try{return env.sessionStorage?.getItem(key)||null;}catch{return null;}};
 const write=(key,value)=>{try{env.sessionStorage?.setItem(key,value);}catch{/* Keep same-tab memory fallback; never store the contact draft. */}};
 function context() {
  if(!memory){try{memory=JSON.parse(read(CONTEXT));}catch{memory=null;}}
  // Explicit staff/test marking is a measurement label, never an access grant.
  let requested=null;try{requested=new URL(env.location.href).searchParams.get('hrs_traffic');}catch{/* Ignore malformed URLs. */}
  let persistent=false;
  try{if(env.localStorage){traffic=env.localStorage.getItem('hrs.website.traffic.v1');persistent=true;}}catch{/* Use same-tab context when storage is blocked. */}
  if(['internal','qa','external'].includes(requested)){
   traffic=requested==='external'?null:requested;
   try{if(traffic)env.localStorage?.setItem('hrs.website.traffic.v1',traffic);else env.localStorage?.removeItem('hrs.website.traffic.v1');}catch{/* Keep same-tab fallback. */}
  }else if(!persistent&&!traffic&&['internal','qa'].includes(memory?.attribution?.traffic_type))traffic=memory.attribution.traffic_type;
  if(!['internal','qa'].includes(traffic))traffic=null;
  // Previously marked sessions stay excluded in reports; resuming needs a new
  // measurement session. The separate pending submission key must stay intact.
  if(!traffic&&['internal','qa'].includes(memory?.attribution?.traffic_type))memory=null;
  if(!memory||!UUID.test(memory.sessionId||'')||!Number.isFinite(memory.savedAt)||memory.savedAt>now()||now()-memory.savedAt>=24*60*60*1000||!validateAttribution(memory.attribution)) {
   memory={sessionId:env.crypto.randomUUID(),savedAt:now(),attribution:privacy()?{}:captureAttribution(env.location.href,env.document?.referrer||'')};
   sent.clear();
  }
  if(privacy())memory.attribution={};
  if(traffic)memory.attribution.traffic_type=traffic;else delete memory.attribution.traffic_type;
  write(CONTEXT,JSON.stringify(memory));
  return {sessionId:memory.sessionId,attribution:{...memory.attribution}};
 }
 function submission() {
  const c=context();pending=pending||read(PENDING);
  if(!UUID.test(pending||'')){pending=env.crypto.randomUUID();write(PENDING,pending);}
  return {...c,submissionKey:pending};
 }
 function complete(){pending=null;try{env.sessionStorage?.removeItem(PENDING);}catch{/* Only the random retry key is cleared. */}}
 async function emit(action,path) {
  if(privacy())return false;
  try{
   const body={...context(),action,path},key=`${body.sessionId}:${action}:${path}`;
   if(!validPublicEvent(body)||sent.has(key))return false;
   const response=await env.fetch('/api/website-events',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),keepalive:true});
   if(!response.ok)return false;
   sent.add(key);return true;
  }catch{return false;}
 }
 return {context,submission,complete,emit};
}
let browserTracker;
function browser(){
 if(typeof window==='undefined'||!window.crypto?.randomUUID)return null;
 if(!browserTracker)browserTracker=createWebsiteTracker({location:window.location,document:window.document,navigator:window.navigator,crypto:window.crypto,get localStorage(){try{return window.localStorage;}catch{return null;}},get sessionStorage(){try{return window.sessionStorage;}catch{return null;}},fetch:(...args)=>window.fetch(...args)});
 return browserTracker;
}
export function websiteSubmission(){return browser()?.submission() || {};}
export function completeWebsiteSubmission(){browser()?.complete();}
export function recordWebsiteEvent(action,path){return browser()?.emit(action,path) || Promise.resolve(false);}
export function captureWebsiteContext(){try{return browser()?.context() || null;}catch{return null;}}
