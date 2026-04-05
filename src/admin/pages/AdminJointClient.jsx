import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, portalFetch } from '../../lib/supabase';
import { useAdminToast } from '../context/AdminToastContext';
import AdminSimplePage from './AdminSimplePage';
import { AdminCard } from '../components/AdminCard';

export default function AdminJointClient() {
  const navigate = useNavigate();
  const { showToast } = useAdminToast();
  const [a, setA] = useState({ first_name: '', last_name: '', email: '' });
  const [b, setB] = useState({ first_name: '', last_name: '', email: '' });
  const [saving, setSaving] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    if (!a.first_name || !a.last_name || !b.first_name || !b.last_name) {
      alert('Both primary and joint need first and last name.');
      return;
    }
    setSaving(true);
    const { data: c1, error: e1 } = await supabase
      .from('clients')
      .insert({ ...a, status: 'active', notes: 'Joint — primary' })
      .select()
      .single();
    if (e1) {
      showToast(e1.message, 'error');
      setSaving(false);
      return;
    }
    const { data: c2, error: e2 } = await supabase
      .from('clients')
      .insert({
        ...b,
        status: 'active',
        notes: `Joint with primary client ${c1.id}`,
      })
      .select()
      .single();
    if (e2) {
      showToast(e2.message, 'error');
      setSaving(false);
      return;
    }
    try {
      await portalFetch('/api/clients/push-to-ghl', {
        method: 'POST',
        body: JSON.stringify({ clientId: c1.id }),
      });
    } catch {
      /* optional */
    }
    setSaving(false);
    navigate(`/admin/clients/${c1.id}?joint=${c2.id}`);
  };

  return (
    <AdminSimplePage
      title="Add joint client"
      subtitle="Creates two linked client records (extend schema with joint_id for full pairing)."
    >
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
