import { useState } from 'react';
import { supabase, portalFetch } from '../../lib/supabase';

const DOC_TYPES = [
  { value: 'other', label: 'General' },
  { value: 'id_doc', label: 'ID' },
  { value: 'credit_report', label: 'Credit report' },
  { value: 'dispute_letter', label: 'Dispute letter' },
];

export default function AdminDocumentList({ clientId, documents, onReload, showToast }) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [selectedType, setSelectedType] = useState('other');

  const directUpload = async (file) => {
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${clientId}/${timestamp}_${safeName}`;
    const { error: uploadError } = await supabase.storage.from('client-documents').upload(filePath, file);
    if (uploadError) throw new Error(uploadError.message);
    const { data: urlObj } = supabase.storage.from('client-documents').getPublicUrl(filePath);
    await supabase.from('documents').insert({
      client_id: clientId,
      name: file.name,
      type: selectedType,
      file_url: urlObj.publicUrl,
      file_path: filePath,
      file_size: file.size,
    });
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      showToast('File must be under 10MB.', 'error');
      return;
    }
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowed.includes(file.type)) {
      showToast('Only PDF, JPG, and PNG files.', 'error');
      return;
    }
    setUploading(true);
    try {
      const urlRes = await portalFetch('/api/documents/upload-url', {
        method: 'POST',
        body: JSON.stringify({ clientId, fileName: file.name, fileType: file.type, docType: selectedType }),
      });
      const contentType = urlRes.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        await directUpload(file);
        showToast('Document uploaded.', 'success');
        onReload();
        return;
      }
      const urlData = await urlRes.json();
      if (!urlRes.ok) throw new Error(urlData.error);
      const uploadRes = await fetch(urlData.signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      if (!uploadRes.ok) throw new Error('Upload failed');
      const { data: urlObj } = supabase.storage.from('client-documents').getPublicUrl(urlData.filePath);
      await supabase.from('documents').insert({
        client_id: clientId,
        name: file.name,
        type: selectedType,
        file_url: urlObj.publicUrl,
        file_path: urlData.filePath,
        file_size: file.size,
      });
      showToast('Document uploaded.', 'success');
      onReload();
    } catch {
      try {
        await directUpload(file);
        showToast('Document uploaded.', 'success');
        onReload();
      } catch (e2) {
        showToast(e2.message || 'Upload failed', 'error');
      }
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (doc) => {
    if (!window.confirm('Delete this document?')) return;
    setDeleting(doc.id);
    try {
      const res = await portalFetch('/api/documents/delete-document', {
        method: 'DELETE',
        body: JSON.stringify({ documentId: doc.id }),
      });
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        if (doc.file_path) await supabase.storage.from('client-documents').remove([doc.file_path]);
        await supabase.from('documents').delete().eq('id', doc.id);
      }
      showToast('Deleted.', 'success');
      onReload();
    } catch {
      await supabase.from('documents').delete().eq('id', doc.id);
      onReload();
    }
    setDeleting(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <select
          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          {DOC_TYPES.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <label className="cursor-pointer rounded-lg bg-[#2562FF] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1d52d8]">
          {uploading ? 'Uploading…' : 'Upload file'}
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>
      {documents.length === 0 ? (
        <p className="text-xs text-slate-500">No documents yet. PDF, JPG, or PNG up to 10MB.</p>
      ) : (
        <ul className="max-h-40 space-y-2 overflow-auto text-xs">
          {documents.map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-2 py-1.5">
              <span className="truncate font-medium text-slate-800">{d.name}</span>
              <span className="flex shrink-0 gap-1">
                {d.file_url && (
                  <a
                    href={d.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#2562FF] hover:underline"
                  >
                    Open
                  </a>
                )}
                <button
                  type="button"
                  className="text-red-600"
                  disabled={deleting === d.id}
                  onClick={() => handleDelete(d)}
                >
                  {deleting === d.id ? '…' : '×'}
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
