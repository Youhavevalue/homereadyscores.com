import { useState } from 'react';
import { supabase } from '../../lib/supabase';

function localDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export default function ClientFollowUp({ client, onSaved, showToast }) {
  const [draft, setDraft] = useState({
    assigned_to: client.assigned_to || '',
    next_action: client.next_action || '',
    next_action_at: localDateTime(client.next_action_at),
    review_notes: client.review_notes || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const change = (field, value) => setDraft((previous) => ({ ...previous, [field]: value }));
  const save = async () => {
    if (saving) return;
    setSaving(true);
    setError('');
    try {
      const nextDate = new Date(draft.next_action_at);
      if (!draft.assigned_to.trim() || !draft.next_action.trim() || !Number.isFinite(nextDate.getTime())) {
        throw new Error('Assigned owner, next action and a valid date/time are required.');
      }
      if (!client.updated_at || !Number.isFinite(Date.parse(client.updated_at))) {
        throw new Error('Client version is unavailable. Reload the client before saving.');
      }
      const updatedAt = new Date(Math.max(Date.now(), Date.parse(client.updated_at) + 1)).toISOString();
      const { data, error: saveError } = await supabase.from('clients').update({
        assigned_to: draft.assigned_to.trim(),
        next_action: draft.next_action.trim(),
        next_action_at: nextDate.toISOString(),
        review_notes: draft.review_notes.trim(),
        updated_at: updatedAt,
      }).eq('id', client.id).eq('updated_at', client.updated_at).select('*').single();
      if (saveError) throw new Error(saveError.message);
      if (!data) throw new Error('Client changed or is unavailable. Reload before saving.');
      showToast?.('Follow-up saved.', 'success');
      onSaved(data);
    } catch (saveError) {
      setError(saveError.message || 'Follow-up could not be saved. Your draft remains available.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section id="follow-up" className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="font-display font-bold text-[#002D5B]">Follow-up tracker</h2>
      {error && <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      <div className="grid gap-3 md:grid-cols-2">
        {[
          ['assigned_to', 'Assigned owner', 'text', 200],
          ['next_action', 'Next action', 'text', 500],
          ['next_action_at', 'Next action date/time (local)', 'datetime-local', undefined],
        ].map(([field, label, type, maxLength]) => (
          <label key={field} className="text-sm">{label}
            <input name={field} type={type} maxLength={maxLength} required disabled={saving}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              value={draft[field]} onChange={(event) => change(field, event.target.value)} />
          </label>
        ))}
        <label className="text-sm md:col-span-2">Review notes
          <textarea name="review_notes" maxLength={1000} disabled={saving}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            value={draft.review_notes} onChange={(event) => change('review_notes', event.target.value)} />
        </label>
      </div>
      <button type="button" onClick={save} disabled={saving}
        className="rounded-xl bg-[#2562FF] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
        {saving ? 'Saving…' : 'Save follow-up'}
      </button>
      <p className="text-xs text-slate-500">Date/time uses your device’s local time zone. This records a private next action; reminders and customer messaging are paused.</p>
    </section>
  );
}
