import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { portalFetch } from '../lib/supabase';

const kinds = ['consent', 'disclosure', 'agreement', 'cancellation'];
const confirmedCase = value => value && typeof value.id === 'string' && Number.isInteger(value.revision) && value.record && typeof value.record.status === 'string';
const hasKind = (values, kind) => Array.isArray(values) ? values.includes(kind) : Boolean(values?.[kind]);
const inputClass = 'mt-1 block w-full rounded-lg border border-slate-300 p-2';
const buttonClass = 'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold disabled:opacity-40';

// Public cases omit grant generation. The local epoch covers known resets; valid same-case cookie changes in another tab cannot be detected here.
const caseIdentity = value => value?.id ?? null;

export default function ContractSigning() {
  const [current, setCurrent] = useState(null);
  const { search } = useLocation();
  const caseId = (new URLSearchParams(search).get('case') || '').trim();
  const [accessCode, setAccessCode] = useState('');
  const [accessCodeCase, setAccessCodeCase] = useState(caseId);
  const invitationCode = accessCodeCase === caseId ? accessCode : '';
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [accessConfirmed, setAccessConfirmed] = useState(false);
  const [disclosureAcknowledged, setDisclosureAcknowledged] = useState(false);
  const [typedName, setTypedName] = useState('');
  const [signatureIntent, setSignatureIntent] = useState(false);
  const [copyAcknowledged, setCopyAcknowledged] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [fresh, setFresh] = useState(false);
  const [readyFile, setReadyFile] = useState(null);
  const inFlight = useRef(null);
  const active = useRef(true);
  const epoch = useRef(0);
  const fileEpoch = useRef(0);
  const currentIdentity = useRef(null);
  const prepared = useRef(null);
  const readyHeading = useRef(null);

  const clearPrepared = useCallback(() => {
    fileEpoch.current += 1;
    if (prepared.current) URL.revokeObjectURL(prepared.current.url);
    prepared.current = null;
    if (active.current) setReadyFile(null);
  }, []);
  const clearHumanDrafts = useCallback(() => {
    setTypedName(''); setSignatureIntent(false); setConsentAccepted(false); setAccessConfirmed(false);
    setDisclosureAcknowledged(false); setCopyAcknowledged(false); setCancellationReason('');
  }, []);
  const clearSession = useCallback(() => {
    epoch.current += 1;
    clearPrepared(); currentIdentity.current = null;
    if (active.current) { clearHumanDrafts(); setCurrent(null); setFresh(false); }
  }, [clearHumanDrafts, clearPrepared]);
  const live = useCallback(token => active.current && inFlight.current === token && epoch.current === token.epoch, []);
  const fileLive = useCallback(token => live(token) && fileEpoch.current === token.fileEpoch, [live]);
  const adoptCase = useCallback(value => {
    const identity = caseIdentity(value);
    if (caseId && identity.toLowerCase() !== caseId.toLowerCase()) {
      const message = 'This session does not match this invitation. Enter the code for this invitation to continue.';
      clearSession(); setError(message);
      throw new Error(message);
    }
    if (currentIdentity.current && currentIdentity.current !== identity) {
      epoch.current += 1;
      clearPrepared();
      clearHumanDrafts();
    }
    currentIdentity.current = identity; setCurrent(value); setFresh(true);
  }, [caseId, clearHumanDrafts, clearPrepared, clearSession]);
  const responseFailure = useCallback((response, body, fallback) => {
    const message = body?.error || fallback;
    if ([401, 403].includes(response.status)) { clearSession(); if (active.current) setError(message); }
    return new Error(message);
  }, [clearSession]);
  const readCase = useCallback(async token => {
    const expectedCase = caseId || token.identity;
    const response = await portalFetch('/api/contract-signing' + (expectedCase ? `?caseId=${encodeURIComponent(expectedCase)}` : ''));
    if (!live(token)) return null;
    if ([401, 403].includes(response.status)) throw responseFailure(response, null, 'Signer session is unavailable. Open a fresh invitation to continue.');
    const body = await response.json();
    if (!live(token)) return null;
    if (!response.ok) throw responseFailure(response, body, 'Contract could not be loaded. Retry or enter a fresh invitation.');
    if (!confirmedCase(body.case)) throw new Error('Contract state could not be confirmed. Reload before continuing.');
    adoptCase(body.case);
    return body.case;
  }, [adoptCase, caseId, live, responseFailure]);
  async function run(action, payload = {}) {
    const expectedCase = caseId || currentIdentity.current;
    const sessionReset = action === 'exchange' || action === 'logout';
    if (inFlight.current && !sessionReset) return;
    if (sessionReset) clearSession();
    if (action === 'document' || action === 'certificate') clearPrepared();
    const token = { epoch: epoch.current, fileEpoch: fileEpoch.current, identity: currentIdentity.current };
    inFlight.current = token; setBusy(true); setError(''); setNotice('');
    try {
      if (action === 'load') await readCase(token);
      else if (action === 'document' || action === 'certificate') {
        setFresh(false);
        const response = await portalFetch(action === 'document' ? '/api/contract-document' : `/api/contract-signing?certificate=1&caseId=${encodeURIComponent(expectedCase)}`, action === 'document' ? { method: 'POST', body: JSON.stringify({ kind: payload.kind, caseId: expectedCase }) } : {});
        if (!live(token)) return;
        if ([401, 403].includes(response.status)) throw responseFailure(response, null, 'Signer session is unavailable. Open a fresh invitation to continue.');
        if (!fileLive(token)) return;
        if (!response.ok) { const body = await response.json(); if (!live(token)) return; throw responseFailure(response, body, 'File preparation failed. Please retry.'); }
        const blob = await response.blob();
        if (!fileLive(token)) return;
        if (!blob.size || (action === 'document' && blob.type !== 'application/pdf') || (action === 'certificate' && !blob.type.includes('json'))) throw new Error('File format could not be confirmed. Please retry.');
        // The transfer can advance the revision. Publish bytes only after a fresh same-session read.
        const refreshed = await readCase(token);
        if (!fileLive(token) || caseIdentity(refreshed) !== token.identity || currentIdentity.current !== token.identity) return;
        const file = { url: URL.createObjectURL(blob), filename: action === 'document' ? `contract-${payload.kind}.pdf` : 'contract-evidence-certificate.json', identity: token.identity };
        prepared.current = file; setReadyFile(file);
        setNotice('Your file is ready to open. It has not been saved or read for you. A server transfer does not record a human receipt.');
      } else if (action === 'logout') {
        const response = await portalFetch(`/api/contract-signing?caseId=${encodeURIComponent(expectedCase)}`, { method: 'DELETE' });
        if (!live(token)) return;
        if ([401, 403].includes(response.status)) throw responseFailure(response, null, 'Signer session is unavailable. Open a fresh invitation to continue.');
        if (!response.ok) throw new Error('Session could not be closed. Please retry.');
        setNotice('Signer session closed.');
      } else {
        const response = await portalFetch('/api/contract-signing', {
          method: 'POST', body: JSON.stringify(action === 'exchange' ? { action, caseId: caseId.trim(), accessCode: invitationCode.trim() } : { action, caseId: expectedCase, expectedRevision: current.revision, payload }),
        });
        if (!live(token)) return;
        if ([401, 403].includes(response.status)) throw responseFailure(response, null, 'Signer session is unavailable. Open a fresh invitation to continue.');
        const body = await response.json();
        if (!live(token)) return;
        if (!response.ok) throw responseFailure(response, body, 'Request failed. Your entries are preserved.');
        if (action === 'exchange') {
          if (confirmedCase(body.case)) adoptCase(body.case); else await readCase(token);
          if (!live(token)) return;
          setAccessCode(''); clearHumanDrafts();
        } else {
          if (!confirmedCase(body.case)) { setFresh(false); throw new Error('Updated contract state could not be confirmed. Reload before continuing.'); }
          adoptCase(body.case);
          if (!live(token)) return;
        }
        setNotice('Server recorded the request. See the confirmed status and timestamps below.');
      }
    } catch (failure) {
      if (live(token)) { if (action === 'load') setFresh(false); setError(failure.message || 'Request failed. Your entries are preserved.'); }
    } finally {
      if (active.current && inFlight.current === token) { inFlight.current = null; setBusy(false); }
    }
  }
  useEffect(() => {
    active.current = true;
    clearHumanDrafts(); setCurrent(null); setFresh(false); setReadyFile(null); setAccessCode(''); setAccessCodeCase(caseId);
    const token = { epoch: epoch.current, identity: currentIdentity.current };
    inFlight.current = token; setBusy(true);
    void readCase(token).catch(failure => {
      if (live(token)) { setFresh(false); setError(failure.message || 'Contract could not be loaded.'); }
    }).finally(() => { if (active.current && inFlight.current === token) { inFlight.current = null; setBusy(false); } });
    return () => { active.current = false; clearSession(); inFlight.current = null; };
  }, [caseId, clearHumanDrafts, clearSession, live, readCase]);
  useEffect(() => {
    if (readyFile) { readyHeading.current?.focus(); readyHeading.current?.scrollIntoView({ block: 'nearest' }); }
  }, [readyFile]);

  const visibleCurrent = !caseId || current?.id?.toLowerCase() === caseId.toLowerCase() ? current : null;
  const visibleReadyFile = readyFile?.identity === visibleCurrent?.id ? readyFile : null;
  const record = visibleCurrent?.record || {};
  const packet = record.packet || {};
  const electronic = packet.electronicConsentTerms || {};
  const offered = record.status === 'offered';
  const requestable = ['offered', 'signed'].includes(record.status);
  const signed = record.status === 'signed' && Boolean(record.signedAt);
  const recoveryOnly = visibleCurrent?.recoveryOnly === true && record.status === 'cancelled' && !record.signedAt;
  const copies = record.status === 'signed' || (record.status === 'cancelled' && (Boolean(record.signedAt) || recoveryOnly));
  const held = Boolean(record.withdrawnAt || record.consentWithdrawnAt || record.paperRequestedAt || record.paperRequestAt);
  const canAct = !busy && fresh;
  const canPrepare = !busy && Boolean(visibleCurrent);
  const signingEnabled = visibleCurrent?.signingEnabled === true;
  const served = kind => hasKind(record.servedKinds, kind);
  const electronicComplete = ['scope', 'paperProcedure', 'withdrawalProcedure', 'contactUpdateProcedure', 'fees', 'hardwareSoftware', 'retention'].every(key => typeof electronic[key] === 'string' && electronic[key].trim());
  const canSign = canAct && signingEnabled && offered && !held && Boolean(record.approvedAt && record.consentAt && record.disclosureReceiptAt) && kinds.every(served) && typedName.trim() === record.signerName && signatureIntent;

  return <main className="mx-auto max-w-4xl space-y-5 px-4 py-12 text-slate-800">
    <img src="/brand/c05/logos/logo-horizontal-primary.svg" alt="HomeReady Scores" width="216" height="66" className="max-w-full h-auto" />
    <h1 className="text-3xl font-bold">Review your contract packet</h1>
    <p className="rounded-lg border border-amber-300 bg-amber-50 p-4">Signing requires the business to adopt and approve this exact packet. Service activation is held even after signature. This page sends no messages or payments.</p>
    <p>Invite possession is not independent proof of identity. This session accesses only the invited case.</p>
    {error && <p role="alert" className="text-red-800">{error}</p>}
    {notice && <p role="status">{notice}</p>}
    <section className="space-y-3 rounded-xl border p-4">
      <h2 className="text-xl font-semibold">Open an invitation</h2>
      <input type="hidden" name="caseId" value={caseId} readOnly />
      <p>{caseId ? 'Enter the one-time code provided with your private signing link.' : 'Use the private signing link provided by staff to open a new invitation. An existing signer session can be reloaded below.'}</p>
      <label className="block">One-time access code<input className={inputClass} name="accessCode" autoComplete="off" value={invitationCode} onChange={event => { setAccessCodeCase(caseId); setAccessCode(event.target.value); }} /></label>
      <div className="flex flex-wrap gap-2"><button className={buttonClass} type="button" disabled={!caseId.trim() || !invitationCode.trim()} onClick={() => run('exchange')}>Open contract</button><button className={buttonClass} type="button" disabled={busy} onClick={() => run('load')}>Reload contract</button>{visibleCurrent && <button className={buttonClass} type="button" onClick={() => run('logout')}>Close signer session</button>}</div>
    </section>
    {visibleCurrent && <section className="space-y-3 rounded-xl border border-blue-300 bg-blue-50 p-4">
      {visibleReadyFile ? <><h2 ref={readyHeading} tabIndex={-1} className="scroll-mt-28 text-xl font-semibold">Your prepared file</h2>
        <p>{visibleReadyFile.filename}</p><a className="inline-block rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white" href={visibleReadyFile.url} target="_blank" rel="noopener noreferrer">Open prepared file</a>
        <p>Open the file, then use your browser’s Save as command and choose the intended folder. Check that the file opens and that you can retain it. No file has been saved automatically.</p></> : <h2 className="text-xl font-semibold">Prepare a file to open and save</h2>}
      <button className={buttonClass} type="button" onClick={() => { clearPrepared(); setNotice('Prepared file cleared from this page.'); }}>Clear prepared file</button>
      <p>Preparing another file replaces this one. Clearing this page does not remove copies you already opened or saved. File transfer and opening are separate from your acknowledgements below.</p>
    </section>}
    {visibleCurrent && <>
      {recoveryOnly ? <p role="status" className="rounded-lg border border-amber-300 p-4">Cancelled contract: retained copies and cancellation record only; cannot sign or restart services.</p> : !signingEnabled && <p role="status" className="rounded-lg border border-amber-300 p-4">New contract signing is currently on hold. Existing cancellation, paper requests, withdrawal requests, and retained-copy access remain available.</p>}
      <section className="space-y-2 rounded-xl border p-4"><h2 className="text-xl font-semibold">Exact packet</h2>
        <p>Status: {record.status}</p>
        {!fresh && <p role="alert">The displayed case may be out of date. Reload the contract before recording any further action.</p>}
        <p>Signer: {record.signerName} · state: {record.clientState}</p><p>Version: {packet.version || 'Not confirmed'}</p>
        <dl className="space-y-2"><dt className="font-semibold">Services</dt><dd className="whitespace-pre-wrap">{packet.services || 'Not confirmed'}</dd><dt className="font-semibold">Total fee</dt><dd>{Number.isSafeInteger(packet.totalFeeCents) ? `$${(packet.totalFeeCents / 100).toFixed(2)}` : 'Not confirmed'}</dd><dt className="font-semibold">Duration</dt><dd>{packet.duration || 'Not confirmed'}{Number.isInteger(packet.durationDays) ? ` (${packet.durationDays} days)` : ''}</dd><dt className="font-semibold">Payment terms</dt><dd className="whitespace-pre-wrap">{packet.paymentTerms || 'Not confirmed'}</dd></dl>
        <h3 className="font-semibold">Reviewed dates for this exact packet</h3>
        <dl className="space-y-2"><dt className="font-semibold">Signing date</dt><dd>{packet.dateBinding?.signingDate || 'Not confirmed'}</dd><dt className="font-semibold">Review timezone</dt><dd>{packet.dateBinding?.timeZone || 'Not confirmed'}</dd><dt className="font-semibold">Cancellation deadline stated in the reviewed packet</dt><dd>{packet.dateBinding?.cancellationDeadline || 'Not confirmed'}</dd></dl>
        <p>An outdated signing date requires a new reviewed packet version before signing. The server checks the reviewed date gate. This page does not guess a business-day or holiday calendar, substitute the current date, or calculate a new deadline. Later copy access and cancellation requests remain available.</p>
        {record.signedAt && <p>Signature recorded at {record.signedAt} for {record.signatureName || record.signerName}.</p>}
        {record.cancellationAt && <p>Cancellation recorded at {record.cancellationAt}. Activation remains held.</p>}
        {record.cancellationAt && typeof record.cancellationReason === 'string' && record.cancellationReason && <p>Recorded cancellation reason: {record.cancellationReason}</p>}
        {record.copyReceiptAt && <p>Copy receipt recorded at {record.copyReceiptAt}.</p>}
      </section>
      <section className="space-y-3 rounded-xl border p-4"><h2 className="text-xl font-semibold">1. Electronic records and access</h2>
        <dl className="space-y-2">{[['scope','Scope of consent'],['paperProcedure','Paper copy procedure'],['withdrawalProcedure','Withdrawal procedure'],['contactUpdateProcedure','Contact update procedure'],['fees','Paper and copy fees'],['hardwareSoftware','Required hardware and software'],['retention','Access and retention requirements']].map(([key,label]) => <div key={key}><dt className="font-semibold">{label}</dt><dd className="whitespace-pre-wrap">{electronic[key] || 'Not confirmed. Contact staff before consenting.'}</dd></div>)}</dl>
        <button className={buttonClass} type="button" disabled={!canPrepare} onClick={() => run('document', {kind:'consent'})}>Prepare consent PDF</button>
        <label className="block"><input type="checkbox" name="accessConfirmed" checked={accessConfirmed} onChange={event => setAccessConfirmed(event.target.checked)} /> I opened the consent PDF and can access and retain electronic records using the stated requirements.</label>
        <label className="block"><input type="checkbox" name="consentAccepted" checked={consentAccepted} onChange={event => setConsentAccepted(event.target.checked)} /> I affirmatively consent to the stated use of electronic records and signatures.</label>
        <button className={buttonClass} type="button" disabled={!canAct || !signingEnabled || !offered || held || Boolean(record.consentAt) || !served('consent') || !consentAccepted || !accessConfirmed || !electronicComplete} onClick={() => run('consent', {accepted:true,accessConfirmed:true})}>Record electronic consent</button>
        {record.consentAt && <p>Electronic consent recorded at {record.consentAt}.</p>}
        <div className="flex flex-wrap gap-2"><button className={buttonClass} type="button" disabled={!canAct || !requestable} onClick={() => run('paper_request')}>Request paper records</button><button className={buttonClass} type="button" disabled={!canAct || !requestable || !record.consentAt} onClick={() => run('withdraw_consent')}>Withdraw electronic consent</button></div>
        <p>Paper and withdrawal requests place signing on hold and preserve earlier evidence. Contact staff using the packet procedure for further arrangements.</p>
      </section>
      <section className="space-y-3 rounded-xl border p-4"><h2 className="text-xl font-semibold">2. Separate disclosure receipt</h2>
        <button className={buttonClass} type="button" disabled={!canPrepare || (!copies && !record.consentAt)} onClick={() => run('document', {kind:'disclosure'})}>Prepare disclosure PDF</button>
        <label className="block"><input type="checkbox" name="disclosureAcknowledged" checked={disclosureAcknowledged} onChange={event => setDisclosureAcknowledged(event.target.checked)} /> I acknowledge receipt of the separate disclosure document.</label>
        <button className={buttonClass} type="button" disabled={!canAct || !signingEnabled || !offered || held || !record.consentAt || !served('disclosure') || !disclosureAcknowledged || Boolean(record.disclosureReceiptAt)} onClick={() => run('disclosure_receipt', {acknowledged:true})}>Record disclosure receipt</button>
        {record.disclosureReceiptAt && <p>Separate disclosure receipt recorded at {record.disclosureReceiptAt}.</p>}
      </section>
      <section className="space-y-3 rounded-xl border p-4"><h2 className="text-xl font-semibold">3. Review and sign</h2>
        {['agreement','cancellation'].map(kind => <button key={kind} className={`${buttonClass} mr-2`} type="button" disabled={!canPrepare || (!copies && !record.disclosureReceiptAt)} onClick={() => run('document', {kind})}>Prepare {kind} PDF</button>)}
        <p>{recoveryOnly ? 'You may download the four exact packet PDFs for your retained records. This does not record consent, a disclosure acknowledgement, or a signature.' : 'Download all four exact PDFs before signing. Each transfer is recorded separately; your acknowledgements remain separate from transfer records.'}</p>
        <label className="block">Type your exact signer name<input className={inputClass} name="typedName" autoComplete="off" value={typedName} onChange={event => setTypedName(event.target.value)} /></label>
        <label className="block"><input type="checkbox" name="signatureIntent" checked={signatureIntent} onChange={event => setSignatureIntent(event.target.checked)} /> I intend this typed name to be my electronic signature on this exact packet.</label>
        <button className={buttonClass} type="button" disabled={!canSign} onClick={() => run('sign', {typedName:typedName.trim(),intent:true})}>Sign exact packet</button>
        {held && <p>Signing is on hold following a paper or withdrawal request.</p>}
      </section>
      {copies && <section className="space-y-3 rounded-xl border p-4"><h2 className="text-xl font-semibold">{recoveryOnly ? 'Retained packet copies' : 'Your evidence bundle and copy receipt'}</h2>
        <p>{recoveryOnly ? 'Your cancellation remains recorded above. These are the original packet PDFs. No signature was recorded, and this recovery cannot start services.' : 'The evidence bundle consists of the original four exact PDFs and a JSON signature/evidence certificate. Download each PDF again after signing, save the certificate, and retain them together. No combined signature-stamped document is generated.'}</p>
        {!recoveryOnly && <button className={buttonClass} type="button" disabled={!canPrepare} onClick={() => run('certificate')}>Prepare evidence certificate (JSON)</button>}
        <label className="block"><input type="checkbox" name="copyAcknowledged" checked={copyAcknowledged} onChange={event => setCopyAcknowledged(event.target.checked)} /> {recoveryOnly ? 'I can retain the original packet PDFs.' : 'I received and can retain all four PDFs and the JSON evidence certificate.'}</label>
        <button className={buttonClass} type="button" disabled={!canAct || !signed || !record.certificateServedAt || !kinds.every(kind => hasKind(record.copyServedKinds, kind)) || !copyAcknowledged || Boolean(record.copyReceiptAt)} onClick={() => run('copy_receipt', {acknowledged:true})}>Acknowledge copy receipt</button>
      </section>}
      <section className="space-y-3 rounded-xl border p-4"><h2 className="text-xl font-semibold">Cancellation request</h2>
        <p>You may submit a cancellation request before or after signing, including after withdrawing electronic consent. This page does not calculate or reject a request using a guessed deadline.</p>
        <label className="block">Cancellation reason (optional)<textarea className={inputClass} name="cancellationReason" value={cancellationReason} onChange={event => setCancellationReason(event.target.value)} /></label>
        <button className={buttonClass} type="button" disabled={!canAct || !['offered','signed'].includes(record.status)} onClick={() => run('cancel', {reason:cancellationReason.trim()})}>Request cancellation</button>
      </section>
    </>}
  </main>;
}
