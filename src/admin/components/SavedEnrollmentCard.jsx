import {useEffect,useRef,useState} from 'react';
import {portalFetch} from '../../lib/supabase';

export default function SavedEnrollmentCard({requestId}) {
  const [metadata,setMetadata]=useState(null);
  const [card,setCard]=useState(null);
  const [password,setPassword]=useState('');
  const [newCode,setNewCode]=useState('');
  const [notice,setNotice]=useState('');
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(false);
  const generation=useRef(0),controller=useRef(null);

  useEffect(()=>{
    let active=true;
    setMetadata(null);setCard(null);setPassword('');setNewCode('');setNotice('');setError('');
    portalFetch('/api/enrollment-card?requestId='+encodeURIComponent(requestId))
      .then(async response=>{
        if(!response.ok)return;
        const value=await response.json();
        if(active&&value.enabled===true&&typeof value.syntheticOnly==='boolean')setMetadata(value);
      }).catch(()=>{});
    const invalidate=()=>{generation.current++;controller.current?.abort();};
    return()=>{active=false;invalidate();};
  },[requestId]);

  useEffect(()=>{
    const hide=()=>{
      generation.current++;controller.current?.abort();
      setCard(null);setPassword('');setNewCode('');setLoading(false);
    };
    const visibility=()=>{if(document.hidden)hide();};
    window.addEventListener('blur',hide);document.addEventListener('visibilitychange',visibility);
    const timer=card?setTimeout(hide,30000):null;
    return()=>{if(timer)clearTimeout(timer);window.removeEventListener('blur',hide);document.removeEventListener('visibilitychange',visibility);};
  },[card]);

  async function submit(event,action) {
    event.preventDefault();if(loading)return;
    const current=++generation.current;
    controller.current=new AbortController();setLoading(true);setCard(null);setError('');
    const post=async(url,body)=>{
      const response=await portalFetch(url,{method:'POST',body:JSON.stringify(body),signal:controller.current.signal});
      const value=await response.json();
      if(current!==generation.current)throw new DOMException('View changed','AbortError');
      if(!response.ok)throw Error(value.error||'Card access could not be confirmed.');
      return value;
    };
    try {
      const value=await post('/api/enrollment-card',{requestId,password,...(action?{action,...(action==='updateCVV'?{cvv:newCode}:{})}:{})});
      if(action){setNewCode('');setNotice(action==='updateCVV'?'Security code updated. Open the card details to view it.':'Security code removed.');return;}
      if(!value.card||typeof value.card.number!=='string')throw Error('Card could not be retrieved.');
      setCard(value.card);
    } catch(failure) {
      if(current===generation.current&&failure.name!=='AbortError')setError(failure.message||'Card access could not be confirmed.');
    } finally {
      if(current===generation.current){setPassword('');setLoading(false);}
    }
  }

  if(!metadata)return null;
  return <section className="my-6 rounded-2xl border border-gray-200 p-4" aria-labelledby="saved-card-title">
    <h3 id="saved-card-title" className="text-xl font-bold">Saved card</h3>
    {metadata.syntheticOnly&&<p className="my-3">Synthetic database review only. No real card information is accepted.</p>}
    {!metadata.cardSaved?<p>No card saved for this enrollment.</p>:<>
      <p>Card ending {metadata.last4}</p>{metadata.securityCodeRequired&&<p className="my-3">You can view and update the security code for the initial payment. Remove it after that payment is authorized. Recording the initial payment as paid also removes it.</p>}
      {card?<div role="status" className="my-4">
        <dl className="space-y-2 break-words">
          <dt className="font-bold">Cardholder</dt><dd>{card.name}</dd>
          <dt className="font-bold">Full card number</dt><dd className="font-mono text-lg">{card.number}</dd>
          <dt className="font-bold">Expiration</dt><dd>{card.expiry}</dd>
          <dt className="font-bold">Security code (CVV)</dt><dd>{card.cvv||'Not available. Request a current code from the cardholder if needed.'}</dd>
          <dt className="font-bold">Billing address</dt><dd>{card.billingAddressLine1}{card.billingAddressLine2&&<><br/>{card.billingAddressLine2}</>}<br/>{card.billingCity}, {card.billingState} {card.billingZip}</dd>
        </dl>
        <p className="mt-3">Hidden after 30 seconds or when you leave this view.</p>
        <button type="button" className="request-button mt-3" onClick={()=>{generation.current++;setCard(null);}}>Hide card</button>
      </div>:<form onSubmit={event=>submit(event)} className="my-4 space-y-3">
        <label htmlFor="card-reveal-password" className="block font-bold">Re-enter your staff password</label>
        <input id="card-reveal-password" className="request-input" type="password" autoComplete="off" value={password} onChange={event=>setPassword(event.target.value)} maxLength={256} required/>
        <button type="submit" className="request-button request-primary" disabled={loading||!password}>{loading?'Checking…':'View full card details'}</button>
      </form>}
      {metadata.securityCodeRequired&&<form onSubmit={event=>submit(event,'updateCVV')} className="my-4 space-y-3">
        <h4 className="font-bold">Update security code (CVV)</h4>
        <label htmlFor="card-update-cvv" className="block">New CVV supplied by the cardholder</label>
        <input id="card-update-cvv" type="password" inputMode="numeric" autoComplete="off" className="request-input" maxLength={4} value={newCode} onChange={event=>setNewCode(event.target.value.replace(/[^0-9]/g,''))}/>
        <label htmlFor="card-update-password" className="block">Staff password</label>
        <input id="card-update-password" type="password" autoComplete="off" className="request-input" maxLength={256} value={password} onChange={event=>setPassword(event.target.value)}/>
        <button className="request-button request-primary" type="submit" disabled={loading||!password||!/^\d{3,4}$/.test(newCode)}>Save updated CVV</button>
        <button className="request-button" type="button" disabled={loading} onClick={event=>submit(event,'clearCVV')}>Payment authorized — remove CVV</button>
      </form>}
      {notice&&<p role="status">{notice}</p>}
      {error&&<p role="alert">{error}</p>}
    </>}
  </section>;
}
