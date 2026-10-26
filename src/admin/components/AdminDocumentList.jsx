import { useCallback, useEffect, useRef, useState } from 'react';
import { portalFetch } from '../../lib/supabase';

const MAX_SIZE = 10 * 1024 * 1024;
const TYPES = [['other', 'General'], ['id_doc', 'ID'], ['credit_report', 'Credit report'], ['dispute_letter', 'Dispute letter']];
const MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

async function checked(response) {
  let body;
  try { body = await response.json(); } catch { throw new Error('Document service response could not be confirmed. Please retry.'); }
  if (!response.ok) {
    const error = new Error(body.error || 'Document operation could not be completed.');
    error.code = body.code;
    throw error;
  }
  return body;
}
const post = (url, body, method = 'POST') => portalFetch(url, { method, body: JSON.stringify(body) });

export default function AdminDocumentList({ clientId, showToast }) {
  const [documents, setDocuments] = useState([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [readError, setReadError] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [selectedType, setSelectedType] = useState('other');
  const [uploading, setUploading] = useState(false);
  const [pending, setPending] = useState(null);
  const [busyDocument, setBusyDocument] = useState(null);
  const [downloadLink, setDownloadLink] = useState(null);
  const [reconciling, setReconciling] = useState(false);
  const version = useRef(0);

  const load = useCallback(async () => {
    const request = ++version.current;
    setLoading(true); setReadError('');
    try {
      const body = await checked(await portalFetch(`/api/documents/list?clientId=${encodeURIComponent(clientId)}&page=${page}`));
      if (!Array.isArray(body.documents) || body.page !== page || body.pageSize !== 50 || !Number.isInteger(body.total) || body.total < 0) throw new Error('Document list could not be confirmed. Please retry.');
      if (request === version.current) { setDocuments(body.documents); setTotal(body.total); }
    } catch (loadError) {
      if (request === version.current) setReadError(loadError.message || 'Document list unavailable.');
    } finally { if (request === version.current) setLoading(false); }
  }, [clientId, page]);
  useEffect(() => { void load(); return () => { version.current += 1; }; }, [load]);

  async function saveUpload(item) {
    setUploading(true); setError(''); setNotice('');
    try {
      if (item.phase === 'renew') {
        const renewed = await checked(await post('/api/documents/renew', { clientId, operationId: item.operationId }));
        if (renewed.operationId !== item.operationId || typeof renewed.uploadTicket !== 'string' || !renewed.uploadTicket) throw new Error('Verification renewal could not be confirmed. Please retry.');
        item = { ...item, uploadTicket: renewed.uploadTicket, phase: 'finalize' }; setPending(item);
      }
      if (item.phase === 'upload') {
        // Retain a completion retry even if the upload response is lost.
        item = { ...item, phase: 'finalize' }; setPending(item);
        const response = await fetch(item.uploadUrl, { method: 'PUT', headers: { 'Content-Type': item.file.type, 'x-upsert': 'false' }, body: item.file });
        if (!response.ok) throw new Error('Upload could not be confirmed. Use Retry save to check its status.');
      }
      const body = await checked(await post('/api/documents/complete', { clientId, uploadTicket: item.uploadTicket }));
      if (!body.document?.id || typeof body.document.name !== 'string' || typeof body.cleanupPending !== 'boolean') {
        throw new Error('Saved document could not be confirmed. Retry save before starting another upload.');
      }
      setPending(body.cleanupPending ? { ...item, phase: 'cleanup' } : null);
      setNotice(body.cleanupPending ? 'Document saved. Temporary upload cleanup needs a retry.' : 'Document saved.');
      showToast?.('Document saved.', 'success');
      await load();
    } catch (saveError) {
      if (saveError.code === 'UPLOAD_MISSING') setPending({ ...item, phase: 'upload' });
      if (saveError.code === 'UPLOAD_TICKET_EXPIRED') setPending({ ...item, phase: 'renew' });
      if (saveError.code === 'UPLOAD_ACCESS_EXPIRED') setPending(null);
      setError(saveError.message || 'Document save failed. Your upload retry remains available.');
    } finally { setUploading(false); }
  }

  async function chooseFile(event) {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file || uploading) return;
    setError(''); setNotice('');
    if (!MIME_TYPES.includes(file.type) || !Number.isFinite(file.size) || file.size < 1 || file.size > MAX_SIZE) {
      setError('Choose a PDF, JPG or PNG file up to 10 MB.'); return;
    }
    setUploading(true);
    try {
      const body = await checked(await post('/api/documents/upload-url', { clientId, fileName: file.name, fileType: file.type, fileSize: file.size, docType: selectedType }));
      if (typeof body.uploadUrl !== 'string' || !body.uploadUrl || typeof body.uploadTicket !== 'string' || !body.uploadTicket || typeof body.operationId !== 'string' || !body.operationId) {
        throw new Error('Upload access could not be confirmed. No file was sent.');
      }
      const item = { file, uploadUrl: body.uploadUrl, uploadTicket: body.uploadTicket, operationId: body.operationId, phase: 'upload' };
      setPending(item);
      await saveUpload(item);
    } catch (uploadError) { setError(uploadError.message || 'Upload access unavailable.'); }
    finally { setUploading(false); }
  }

  async function reconcile() {
    setReconciling(true); setError(''); setNotice('');
    try {
      const body = await checked(await post('/api/documents/cleanup', { clientId }));
      if (![body.checked, body.deferred, body.failed].every(value => Number.isInteger(value) && value >= 0)) throw new Error('Temporary upload cleanup could not be confirmed. Please retry.');
      setNotice(`${body.checked} cleanup checks completed. ${body.deferred} await expiry or another cleanup run.`);
      if (body.failed) setError(`${body.failed} temporary uploads need a cleanup retry.`);
    } catch (cleanupError) { setError(cleanupError.message || 'Temporary upload cleanup failed. Please retry.'); }
    finally { setReconciling(false); }
  }

  async function discardUpload() {
    if (!pending || !window.confirm(`Discard the pending upload ${pending.file.name}?`)) return;
    setUploading(true); setError(''); setNotice('');
    try {
      const body = await checked(await post('/api/documents/delete-document', { clientId, documentId: pending.operationId }, 'DELETE'));
      if (body.deleted !== true) throw new Error('Pending upload removal could not be confirmed. Please retry.');
      setPending(null); setNotice('Pending upload discarded.'); await load();
    } catch (discardError) { setError(discardError.message || 'Pending upload removal failed. Please retry.'); }
    finally { setUploading(false); }
  }

  async function download(document) {
    const popup = window.open('', '_blank');
    if (popup) popup.opener = null;
    setBusyDocument(document.id); setError(''); setDownloadLink(null);
    try {
      const body = await checked(await post('/api/documents/download-url', { clientId, documentId: document.id }));
      const url = new URL(body.signedUrl);
      if (!['https:', 'http:'].includes(url.protocol) || (url.protocol === 'http:' && !['127.0.0.1', 'localhost'].includes(url.hostname))) {
        throw new Error('Private download link could not be confirmed.');
      }
      if (popup) popup.location.replace(url.href);
      else setDownloadLink({ url: url.href, name: document.name });
    } catch (downloadError) { popup?.close(); setError(downloadError.message || 'Download unavailable.'); }
    finally { setBusyDocument(null); }
  }

  async function remove(document) {
    if (!window.confirm(`Delete ${document.name} from this client's documents?`)) return;
    setBusyDocument(document.id); setError(''); setNotice('');
    try {
      const body = await checked(await post('/api/documents/delete-document', { clientId, documentId: document.id }, 'DELETE'));
      if (body.deleted !== true) throw new Error('Document deletion could not be confirmed. Reload before retrying.');
      setDownloadLink(null); setNotice('Document deleted.'); showToast?.('Document deleted.', 'success'); await load();
    } catch (deleteError) { setError(deleteError.message || 'Document deletion failed. Please retry.'); }
    finally { setBusyDocument(null); }
  }

  return <section className="space-y-3" aria-label="Private client documents">
    <div className="flex flex-wrap items-center gap-2">
      <label className="text-xs">Document type <select value={selectedType} disabled={uploading} onChange={event => setSelectedType(event.target.value)} className="rounded border p-1">
        {TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select></label>
      <label className="rounded bg-blue-700 px-3 py-2 text-xs font-semibold text-white">{uploading ? 'Saving document…' : 'Upload file'}
        <input name="documentFile" type="file" accept=".pdf,.jpg,.jpeg,.png" disabled={uploading || pending !== null} onChange={chooseFile} className="ml-2 max-w-48 text-xs" />
      </label>
      <button type="button" onClick={load} className="rounded border px-2 py-1 text-xs">Reload documents</button>
      <button type="button" disabled={reconciling} onClick={reconcile} className="rounded border px-2 py-1 text-xs disabled:opacity-50">Reconcile temporary uploads</button>
    </div>
    <p className="text-xs text-slate-500">Private staff access. PDF, JPG or PNG up to 10 MB. Files are verified before they appear as saved documents.</p>
    <p className="text-xs text-slate-500">Temporary cleanup handles up to 20 expired uploads per run. Active upload or verification access is preserved.</p>
    <p className="text-xs text-slate-500">Upload records are retained for later file checks, including delayed transfers. Saved documents keep their final file; deleted records can recheck both file locations. Cleanup confirms the current removal result.</p>
    {pending && <div className="rounded border border-amber-200 bg-amber-50 p-2 text-xs">
      <p>Pending upload: {pending.file.name}</p>
      <p>Keep this client page open until you finish the retry or discard this upload. Switching client tabs preserves it; leaving or reloading the page does not.</p>
      <button type="button" disabled={uploading} onClick={() => saveUpload(pending)} className="mt-1 rounded border px-2 py-1 disabled:opacity-50">
        {pending.phase === 'upload' ? 'Retry upload' : pending.phase === 'cleanup' ? 'Retry cleanup' : pending.phase === 'renew' ? 'Renew verification' : 'Retry save'}
      </button>
      {pending.phase !== 'cleanup' && <button type="button" disabled={uploading} onClick={discardUpload} className="ml-2 mt-1 rounded border px-2 py-1 disabled:opacity-50">Discard pending upload</button>}
    </div>}
    {error && <p role="alert" className="rounded bg-red-50 p-2 text-xs text-red-800">{error}</p>}
    {notice && <p role="status" className="rounded bg-green-50 p-2 text-xs text-green-900">{notice}</p>}
    {downloadLink && <a href={downloadLink.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-700 underline">Download {downloadLink.name}</a>}
    {loading && <p className="text-xs">Loading documents…</p>}
    {readError && <p role="alert" className="rounded bg-red-50 p-2 text-xs text-red-800">{readError}</p>}
    {!loading && !readError && <p className="text-xs">Page {page + 1} · {total} total documents</p>}
    {!loading && !readError && (documents.length ? <ul className="max-h-64 space-y-2 overflow-auto text-xs">{documents.map(document => <li key={document.id} className="rounded bg-slate-50 p-2">
      <div className="flex items-center justify-between gap-2"><span className="truncate font-semibold">{document.name}</span><span className="flex gap-2">
        <button type="button" disabled={!document.available || busyDocument !== null} onClick={() => download(document)} className="text-blue-700 underline disabled:opacity-40">Download</button>
        <button type="button" disabled={busyDocument !== null} onClick={() => remove(document)} className="text-red-700 underline disabled:opacity-40">Delete</button>
      </span></div>
      {!document.available && <p className="mt-1 text-amber-800">{document.unavailableReason || 'Private access needs review.'}</p>}
    </li>)}</ul> : <p className="text-xs text-slate-500">{total ? 'No documents on this page. Return to the previous page.' : 'No documents yet.'}</p>)}
    <div className="flex gap-2 text-xs">
      <button type="button" disabled={loading || page === 0} onClick={() => setPage(value => value - 1)} className="rounded border px-2 py-1 disabled:opacity-40">Previous documents</button>
      <button type="button" disabled={loading || (page + 1) * 50 >= total} onClick={() => setPage(value => value + 1)} className="rounded border px-2 py-1 disabled:opacity-40">Next documents</button>
    </div>
  </section>;
}
