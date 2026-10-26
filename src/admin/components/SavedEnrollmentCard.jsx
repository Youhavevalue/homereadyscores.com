import {useEffect,useRef,useState} from 'react';
import {portalFetch} from '../../lib/supabase';

export default function SavedEnrollmentCard({requestId}) {
  const [record,setRecord]=useState(null);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const [newCode,setNewCode]=useState('');
  const [saving,setSaving]=useState(false);
  const [refresh,setRefresh]=useState(0);
  const generation=useRef(0),mutation=useRef(null);
  useEffect(()=>{
    const current=++generation.current,controller=new AbortController();
    setError('');setNewCode('');setSaving(false);
    portalFetch('/api/enrollment-card?requestId='+encodeURIComponent(requestId),{signal:controller.signal})
      .then(async response=>{const value=await response.json();if(generation.current!==current)return;if(!response.ok)throw Error(value.error||'Card details could not be loaded.');setRecord({requestId,...value});})
      .catch(failure=>{if(generation.current===current&&failure.name!=='AbortError')setError('Card details could not be loaded. Please try again.');});
    const invalidate=()=>{generation.current++;controller.abort();mutation.current?.abort();};
    return()=>invalidate();
  },[requestId,refresh]);
  async function save(event,action){
    event.preventDefault();if(saving)return;
    const current=generation.current;mutation.current=new AbortController();setSaving(true);setError('');setNotice('');
    try{
      const response=await portalFetch('/api/enrollment-card',{method:'POST',signal:mutation.current.signal,body:JSON.stringify({requestId,action,...(action==='updateCVV'?{cvv:newCode}:{})})});
      const value=await response.json();if(current!==generation.current)return;
      if(!response.ok||value.success!==true)throw Error(value.error||'Card update could not be confirmed.');
      setNewCode('');setNotice(action==='updateCVV'?'Security code updated.':'Security code removed.');setRefresh(value=>value+1);
    }catch(failure){if(current===generation.current&&failure.name!=='AbortError')setError(failure.message||'Card update could not be confirmed.');}
    finally{if(current===generation.current)setSaving(false);}
  }
  const details=record?.requestId===requestId?record:null,card=details?.card;
  return <section className="my-6 rounded-2xl border border-gray-200 p-4" aria-labelledby="saved-card-title">
    <h3 id="saved-card-title" className="text-xl font-bold">Card and billing details</h3>
    {!details&&!error&&<p>Loading card details…</p>}
    {details&&!details.cardSaved&&<p>No card saved for this enrollment.</p>}
    {card&&<>
      <dl className="my-4 space-y-2 break-words">
        <dt className="font-bold">Cardholder</dt><dd>{card.name}</dd>
        <dt className="font-bold">Card number</dt><dd className="font-mono text-lg">{card.number}</dd>
        <dt className="font-bold">Expiration</dt><dd>{card.expiry}</dd>
        <dt className="font-bold">Security code (CVV)</dt><dd>{card.cvv||'No CVV saved.'}</dd>
        <dt className="font-bold">Billing address</dt><dd>{card.billingAddressLine1}{card.billingAddressLine2&&<><br/>{card.billingAddressLine2}</>}<br/>{card.billingCity}, {card.billingState} {card.billingZip}</dd>
      </dl>
      {details.securityCodeRequired&&<form onSubmit={event=>save(event,'updateCVV')} className="my-4 space-y-3">
        <label htmlFor="card-update-cvv" className="block font-bold">Update CVV supplied by the cardholder</label>
        <input id="card-update-cvv" name="cardSecurityCode" type="text" inputMode="numeric" autoComplete="off" className="request-input" maxLength={4} value={newCode} onChange={event=>setNewCode(event.target.value.replace(/[^0-9]/g,''))}/>
        <button className="request-button request-primary" type="submit" disabled={saving||!/^\d{3,4}$/.test(newCode)}>{saving?'Saving…':'Save updated CVV'}</button>
        <p className="text-sm">Remove the CVV once the related payment is authorized.</p>
        <button className="request-button" type="button" disabled={saving} onClick={event=>save(event,'clearCVV')}>Payment authorized — remove CVV</button>
      </form>}
    </>}
    {notice&&<p role="status">{notice}</p>}
    {error&&<><p role="alert">{error}</p><button type="button" className="request-button" onClick={()=>setRefresh(value=>value+1)}>Reload card details</button></>}
  </section>;
}
