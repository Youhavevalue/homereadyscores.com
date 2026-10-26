import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { readReceipt, clearReceipt } from '../lib/inquiry-receipt';
export default function ThankYou() {
  const [receipt, setReceipt] = useState(() => readReceipt());
  const [copyNotice, setCopyNotice] = useState('');
  const heading = useRef(null);
  useEffect(() => { heading.current?.focus({preventScroll:true}); heading.current?.scrollIntoView({block:'start'}); }, []);
  useEffect(() => {
    if (!receipt) return;
    const refresh = () => setReceipt(readReceipt());
    const timer = window.setTimeout(refresh, Math.max(0, receipt.savedAt + 24*60*60*1000 - Date.now()));
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [receipt]);
  async function copy() {
    try { await navigator.clipboard.writeText(receipt.requestId); setCopyNotice('Reference copied.'); }
    catch { setCopyNotice('Copy is unavailable. Select the reference below and copy it manually.'); }
  }
  return <section className="receipt-page pt-36 pb-24 px-6 max-w-3xl mx-auto"><h1 ref={heading} tabIndex={-1} className="text-4xl font-black mb-6 scroll-mt-32">{receipt ? 'Enrollment received' : 'Find your enrollment reference'}</h1>
    {receipt ? <><p className="mb-6">Your enrollment details have been received. Payment is pending; this confirmation does not mean a charge has completed.</p><p className="mb-2">Enrollment reference:</p><p className="font-bold break-all select-all mb-6">{receipt.requestId}</p><button type="button" className="secondary-button mb-6" onClick={copy}>Copy enrollment reference</button><p role="status" className="mb-4">{copyNotice}</p><p className="mb-6">Keep this reference for follow-up with <a className="underline" href="mailto:help@homereadyscores.com">help@homereadyscores.com</a>. Ask the team how to share documents before sending sensitive information.</p><p className="text-sm text-gray-500 mb-8">This confirmation is retained in this browser tab for up to 24 hours. It shows the saved submission receipt, not a live enrollment-status lookup. Closing the tab or clearing browser storage may remove it.</p></> : <p className="mb-8">No recent submission receipt is available in this tab. This page does not confirm a new enrollment. If you already submitted, use the reference you saved or email <a className="underline" href="mailto:help@homereadyscores.com">help@homereadyscores.com</a> before submitting again.</p>}
    <div className="flex gap-4 flex-wrap"><Link className="secondary-button" to="/">Back to home</Link><Link className="auth-button" to="/get-started" onClick={() => clearReceipt()}>Get Started Now</Link></div>
  </section>;
}
