import {useEffect,useState} from 'react';
import {portalFetch} from '../../lib/supabase';

function confirmed(body,since){
 return body?.since===since&&body.consistency==='separate_reads'&&typeof body.checkedAt==='string'&&Number.isFinite(Date.parse(body.checkedAt))&&Date.parse(body.checkedAt)>=Date.parse(since)&&['open','unscheduled','overdue','newSince'].every(key=>Number.isSafeInteger(body.counts?.[key])&&body.counts[key]>=0);
}

export default function InquiryAttention({since,refreshKey,disabled,onFilter}){
 const [summary,setSummary]=useState(null),[failure,setFailure]=useState(null);
 useEffect(()=>{
  if(typeof since!=='string'||!Number.isFinite(Date.parse(since)))return;
  let active=true,running=false,accessDenied=false,controller;
  async function check(){
   if(!active||running||accessDenied||document.visibilityState!=='visible')return;
   running=true;controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),10000);
   try{
    const params=new URLSearchParams({overview:'1',since});
    const response=await portalFetch('/api/enrollments?'+params,{signal:controller.signal});
    if(response.status===401||response.status===403)accessDenied=true;
    let body;try{body=await response.json();}catch{body=null;}
    if(!response.ok)throw Error(body?.error||(accessDenied?'Sign in to the team portal to check inquiries.':'Attention check unavailable. Reload the queue to retry.'));
    if(!confirmed(body,since))throw Error('Attention counts could not be confirmed. Reload the queue to retry.');
    if(active){setSummary(body);setFailure(null);}
   }catch(error){if(active)setFailure({since,message:error.name==='AbortError'?'Attention check timed out. Reload the queue to retry.':error.message||'Attention check unavailable. Reload the queue to retry.'});}
   finally{clearTimeout(timeout);running=false;}
  }
  void check();
  const interval=setInterval(()=>{void check();},60000);
  const visible=()=>{void check();};document.addEventListener('visibilitychange',visible);
  return()=>{active=false;clearInterval(interval);document.removeEventListener('visibilitychange',visible);controller?.abort();};
 },[since,refreshKey]);
 const current=summary?.since===since?summary:null,error=failure?.since===since?failure.message:'';
 return <aside aria-label="Inquiry follow-up attention" className="inquiry-attention">
  <h2 className="font-bold">Follow-up attention</h2>
  {!current&&!error&&<p role="status">Checking open inquiries…</p>}
  {error&&<div role="alert" className="text-red-800"><p>{error}</p>{current&&<p>Showing previous counts, which may be out of date.</p>}</div>}
  {current&&<>
   <p>{current.counts.open} open · {current.counts.unscheduled} unscheduled · {current.counts.overdue} overdue</p>
   {current.counts.newSince>0&&<div role="status" aria-live="polite"><p className="font-semibold">{current.counts.newSince} new {current.counts.newSince===1?'inquiry':'inquiries'} still open since you opened this queue. Your review draft stays here.</p></div>}
  </>}
  <div className="inquiry-attention-actions">
   <button type="button" disabled={disabled} onClick={()=>onFilter('open')} className="rounded border bg-white px-3 py-2">Show all open</button>
   <button type="button" disabled={disabled} onClick={()=>onFilter('unscheduled')} className="rounded border bg-white px-3 py-2">Show unscheduled open</button>
   <button type="button" disabled={disabled} onClick={()=>onFilter('overdue')} className="rounded border bg-white px-3 py-2">Show overdue open</button>
   <button type="button" disabled={disabled} onClick={()=>onFilter('all')} className="rounded border bg-white px-3 py-2">Show all requests</button>
   {current?.counts.newSince>0&&<button type="button" disabled={disabled} onClick={()=>onFilter('new',since)} className="rounded bg-blue-700 px-3 py-2 text-white">Show new inquiries</button>}
  </div>
  <details className="inquiry-attention-details"><summary>How these checks work</summary>
  {current&&<p className="text-xs">Last checked: <time dateTime={current.checkedAt}>{new Date(current.checkedAt).toLocaleString()}</time>. Counts cover all saved website inquiries, independently of the filters below. Separate reads can change during refresh.</p>}
  {current?.counts.newSince===0&&<p>No new open inquiries recorded since you opened this queue.</p>}
  <p className="text-xs">Checks run once a minute while this page is visible, and when you return to it. No email or text notification is sent. Keep checking this queue during intake hours. Unscheduled means no next-action date; overdue means an open next-action date has passed. These are reminders for staff, not messages to customers.</p></details>
 </aside>;
}
