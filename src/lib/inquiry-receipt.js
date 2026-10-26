const KEY = 'hrs.inquiry.receipt.v1';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function tabStorage() { try { return typeof window === 'undefined' ? null : window.sessionStorage; } catch { return null; } }
export function saveReceipt(result, storage = tabStorage(), now = Date.now()) {
  if (!UUID.test(result?.requestId || '')) return false;
  try { if (!storage) return false; storage.setItem(KEY, JSON.stringify({requestId:result.requestId,savedAt:now})); return true; } catch { return false; }
}
export function readReceipt(storage = tabStorage(), now = Date.now()) {
  try {
    const receipt = JSON.parse(storage?.getItem(KEY) || 'null');
    if (!receipt || !UUID.test(receipt.requestId) || !Number.isFinite(receipt.savedAt) || receipt.savedAt <= 0 || receipt.savedAt > now || now - receipt.savedAt >= 24*60*60*1000) { clearReceipt(storage); return null; }
    return {requestId:receipt.requestId,savedAt:receipt.savedAt};
  } catch { return null; }
}
export function clearReceipt(storage = tabStorage()) { try { storage?.removeItem(KEY); } catch { /* Storage may be disabled. */ } }
