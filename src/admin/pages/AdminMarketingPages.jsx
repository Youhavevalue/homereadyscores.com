import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminSimplePage, { AdminPlaceholderTable } from './AdminSimplePage';
import { AdminCard } from '../components/AdminCard';
import { useAdminToast } from '../context/AdminToastContext';
import { fetchProspects, insertProspect } from '../lib/adminData';

export function ProspectsPage() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const data = await fetchProspects();
      if (!cancelled) {
        setRows(data);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const s = q.toLowerCase().trim();
    if (!s) return rows;
    return rows.filter(
      (r) =>
        `${r.first_name||''} ${r.last_name||''}`.toLowerCase().includes(s) ||
        (r.email || '').toLowerCase().includes(s) ||
        (r.phone || '').includes(s)
    );
  }, [rows, q]);

  return (
    <AdminSimplePage
      title="Prospects"
      subtitle="Leads before conversion to clients."
      actions={
        <Link
          to="/admin/prospects/new"
          className="rounded-xl bg-[#2562FF] px-4 py-2 text-sm font-semibold text-white shadow-sm"
        >
          Add prospect
        </Link>
      }
    >
      <AdminCard title="Search">
        <input
          className="w-full max-w-md rounded-xl border border-slate-200 px-3 py-2 text-sm"
          placeholder="Filter by name, email, phone…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </AdminCard>
      <AdminCard title="Prospects">
        {loading ? (
          <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
        ) : filtered.length === 0 ? (
          <p className="text-sm text-slate-500">
            No prospects yet. Run <code className="rounded bg-slate-100 px-1">sql/admin_operational_migration.sql</code> then
            add prospects.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase text-slate-500">
                  <th className="pb-2 pr-4">Name</th>
                  <th className="pb-2 pr-4">Email</th>
                  <th className="pb-2 pr-4">Phone</th>
                  <th className="pb-2 pr-4">Source</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-slate-50">
                    <td className="py-2 pr-4 font-medium text-[#002D5B]">
                      {r.first_name} {r.last_name}
                    </td>
                    <td className="py-2 pr-4 text-slate-600">{r.email || '—'}</td>
                    <td className="py-2 pr-4">{r.phone || '—'}</td>
                    <td className="py-2 pr-4">{r.source || '—'}</td>
                    <td className="py-2 capitalize">{r.status || 'new'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </AdminSimplePage>
  );
}

export function ProspectNewPage() {
  const navigate = useNavigate();
  const { showToast } = useAdminToast();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    source: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    if (!form.first_name.trim()) {
      showToast('First name is required.', 'error');
      return;
    }
    setSaving(true);
    try {
      await insertProspect({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim() || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        source: form.source.trim() || null,
        notes: form.notes.trim() || null,
        status: 'new',
      });
      showToast('Prospect saved.', 'success');
      navigate('/admin/prospects');
    } catch (err) {
      showToast(err.message || 'Save failed — run admin migration SQL.', 'error');
    }
    setSaving(false);
  };

  return (
    <AdminSimplePage title="Add prospect" subtitle="Capture lead details and trigger autoresponder sequences when wired.">
      <form onSubmit={save}>
        <AdminCard title="Prospect form">
          <div className="grid gap-3 md:grid-cols-2">
            <input
              required
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="First name *"
              value={form.first_name}
              onChange={handleChange('first_name')}
            />
            <input
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Last name"
              value={form.last_name}
              onChange={handleChange('last_name')}
            />
            <input
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={handleChange('email')}
            />
            <input
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Phone"
              value={form.phone}
              onChange={handleChange('phone')}
            />
            <input
              className="md:col-span-2 rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Source (e.g. referral, web)"
              value={form.source}
              onChange={handleChange('source')}
            />
            <textarea
              className="md:col-span-2 min-h-[80px] rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Notes"
              value={form.notes}
              onChange={handleChange('notes')}
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="mt-4 rounded-xl bg-[#002D5B] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save prospect'}
          </button>
        </AdminCard>
      </form>
    </AdminSimplePage>
  );
}

export function AffiliatesPage() {
  return (
    <AdminSimplePage
      title="Affiliates"
      subtitle="Partner accounts and referral attribution."
      actions={
        <div className="flex gap-2">
          <Link
            to="/admin/affiliates/referrals"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold"
          >
            Referral report
          </Link>
          <Link
            to="/admin/affiliates/new"
            className="rounded-xl bg-[#2562FF] px-4 py-2 text-sm font-semibold text-white"
          >
            Add affiliate
          </Link>
        </div>
      }
    >
      <AdminPlaceholderTable columns={['Affiliate', 'Code', 'Clients', 'Actions']} />
    </AdminSimplePage>
  );
}

export function AffiliateNewPage() {
  return (
    <AdminSimplePage title="Add affiliate" subtitle="Create affiliate portal access and tracking codes.">
      <AdminCard title="Affiliate profile">
        <div className="grid gap-3 md:grid-cols-2">
          <input className="rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="Company / name" />
          <input className="rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="Referral code" />
          <input className="md:col-span-2 rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="Email" />
        </div>
        <button
          type="button"
          className="mt-4 rounded-xl bg-[#2562FF] px-4 py-2 text-sm font-semibold text-white"
          onClick={() => alert('Save affiliate')}
        >
          Save
        </button>
      </AdminCard>
    </AdminSimplePage>
  );
}

export function AffiliateReferralsPage() {
  return (
    <AdminSimplePage
      title="Affiliate referral report"
      subtitle="Closing metrics and payouts by affiliate."
    >
      <AdminPlaceholderTable columns={['Affiliate', 'Referrals', 'Funded', 'Revenue']} />
    </AdminSimplePage>
  );
}

export function BrokersPage() {
  return (
    <AdminSimplePage
      title="Brokers"
      subtitle="Mortgage broker partners and referral pipeline."
      actions={
        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/brokers/global"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold"
          >
            Global view
          </Link>
          <Link
            to="/admin/brokers/referrals"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold"
          >
            Referral report
          </Link>
          <Link
            to="/admin/brokers/creation-report"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold"
          >
            Creation report
          </Link>
          <Link
            to="/admin/brokers/new"
            className="rounded-xl bg-[#2562FF] px-3 py-2 text-sm font-semibold text-white"
          >
            Add broker
          </Link>
        </div>
      }
    >
      <AdminPlaceholderTable columns={['Broker', 'NMLS', 'Referrals', 'Actions']} />
    </AdminSimplePage>
  );
}

export function BrokerNewPage() {
  return (
    <AdminSimplePage title="Add broker">
      <AdminCard title="Broker profile">
        <div className="grid gap-3 md:grid-cols-2">
          <input className="rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="Brokerage name" />
          <input className="rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="NMLS #" />
        </div>
        <button type="button" className="mt-4 rounded-xl bg-[#2562FF] px-4 py-2 text-sm font-semibold text-white">
          Save broker
        </button>
      </AdminCard>
    </AdminSimplePage>
  );
}

export function BrokerGlobalPage() {
  return (
    <AdminSimplePage title="Broker global view" subtitle="All brokers at a glance.">
      <AdminPlaceholderTable columns={['Broker', 'Active clients', 'Pipeline']} />
    </AdminSimplePage>
  );
}

export function BrokerReferralReportPage() {
  return (
    <AdminSimplePage title="Broker referral report">
      <AdminPlaceholderTable columns={['Broker', 'Referrals', 'Status']} />
    </AdminSimplePage>
  );
}

export function BrokerCreationReportPage() {
  return (
    <AdminSimplePage title="Broker creation report">
      <AdminPlaceholderTable columns={['Broker', 'Created', 'Source']} />
    </AdminSimplePage>
  );
}
