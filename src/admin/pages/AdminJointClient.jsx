import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { portalFetch } from '../../lib/supabase';
import AdminSimplePage from './AdminSimplePage';
import { AdminCard } from '../components/AdminCard';

export default function AdminJointClient() {
  const navigate = useNavigate();
  const [a, setA] = useState({ first_name: '', last_name: '', email: '' });
  const [b, setB] = useState({ first_name: '', last_name: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const save = async (e) => {
    e.preventDefault();
    if (saving) return;
    if (![a.first_name, a.last_name, b.first_name, b.last_name].every(value => value.trim())) {
      setSaveError('Both clients need a first and last name.');
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      const response = await portalFetch('/api/clients/joint', {
        method: 'POST',
        body: JSON.stringify({ primary: a, joint: b }),
      });
      const result = await response.json();
      if (!response.ok || !result.primaryId || !result.jointId) throw new Error(result.error || 'Joint clients could not be saved.');
      navigate(`/admin/clients/${result.primaryId}?joint=${result.jointId}`);
    } catch (err) {
      setSaveError(err.message || 'Joint clients could not be saved. Your entries are preserved; please retry.');
    } finally { setSaving(false); }
  };

  return (
    <AdminSimplePage
      title="Add joint client"
      subtitle="Creates two pending staff records together, linked by internal notes. No agreement, activation, payment, or customer message is triggered."
    >
      {saveError && <p role="alert" className="mb-4 rounded-xl border border-red-200 p-3 text-red-700">{saveError}</p>}
      <form onSubmit={save}>
        <AdminCard title="Primary client">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              required
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="First name"
              value={a.first_name}
              onChange={(e) => setA({ ...a, first_name: e.target.value })}
            />
            <input
              required
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Last name"
              value={a.last_name}
              onChange={(e) => setA({ ...a, last_name: e.target.value })}
            />
            <input
              className="sm:col-span-2 rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Email"
              type="email"
              value={a.email}
              onChange={(e) => setA({ ...a, email: e.target.value })}
            />
          </div>
        </AdminCard>
        <AdminCard title="Joint client">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              required
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="First name"
              value={b.first_name}
              onChange={(e) => setB({ ...b, first_name: e.target.value })}
            />
            <input
              required
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Last name"
              value={b.last_name}
              onChange={(e) => setB({ ...b, last_name: e.target.value })}
            />
            <input
              className="sm:col-span-2 rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Email"
              type="email"
              value={b.email}
              onChange={(e) => setB({ ...b, email: e.target.value })}
            />
          </div>
        </AdminCard>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate('/admin/clients')}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-[#2562FF] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Create joint pair'}
          </button>
        </div>
      </form>
    </AdminSimplePage>
  );
}
