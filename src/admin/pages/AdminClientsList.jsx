import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, portalFetch } from '../../lib/supabase';
import { useAdminToast } from '../context/AdminToastContext';
import { AdminCard } from '../components/AdminCard';
import { CLIENT_STATUS_FILTERS } from '../constants/hotLinks';

const PAGE_SIZES = [10, 25, 50];

function normKey(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function dfrFor(client) {
  if (!client?.results_expected_date) return '—';
  const t = new Date(client.results_expected_date + 'T12:00:00').getTime();
  return String(Math.max(0, Math.ceil((t - Date.now()) / 86400000)));
}

export default function AdminClientsList() {
  const navigate = useNavigate();
  const { showToast } = useAdminToast();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [recordSearch, setRecordSearch] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(() => new Set());
  const [syncing, setSyncing] = useState(false);

  const loadClients = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('clients')
      .select('*, payments(*)')
      .order('created_at', { ascending: false });
    if (!error) setClients(data || []);
    setLoading(false);
  };

  useEffect(() => {
    const t = setTimeout(() => void loadClients(), 0);
    return () => clearTimeout(t);
  }, []);

  const syncFromGHL = async () => {
    setSyncing(true);
    try {
      const res = await portalFetch('/api/clients/sync-ghl', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        await loadClients();
        showToast(`Synced ${data.synced || 0} clients from GoHighLevel.`, 'success');
      } else {
        showToast(data.error || 'Sync error', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Sync failed', 'error');
    }
    setSyncing(false);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return clients.filter((c) => {
      const matchField = () => {
        if (!q) return true;
        if (recordSearch === 'name') {
          return `${c.first_name || ''} ${c.last_name || ''}`.toLowerCase().includes(q);
        }
        if (recordSearch === 'email') return (c.email || '').toLowerCase().includes(q);
        if (recordSearch === 'phone') return (c.phone || '').includes(q);
        return (
          `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) ||
          (c.email || '').toLowerCase().includes(q) ||
          (c.phone || '').includes(q)
        );
      };
      const matchStatus =
        statusFilter === 'all' || normKey(c.status || 'active') === normKey(statusFilter);
      return matchField() && matchStatus;
    });
  }, [clients, search, statusFilter, recordSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSlice = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  useEffect(() => {
    const t = setTimeout(() => setPage(1), 0);
    return () => clearTimeout(t);
  }, [search, statusFilter, pageSize]);

  const toggleRow = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllPage = () => {
    const ids = pageSlice.map((c) => c.id);
    const allOn = ids.every((id) => selected.has(id));
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOn) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  };

  const exportCsv = () => {
    const source =
      selected.size > 0 ? filtered.filter((c) => selected.has(c.id)) : filtered;
    const headers = [
      'First name',
      'Last name',
      'Email',
      'Phone',
      'Status',
      'Created',
      'Setup fee',
      'Monthly',
      'DFR days',
    ];
    const escape = (v) => {
      const s = String(v ?? '');
      if (s.includes(',') || s.includes('"')) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };
    const lines = [headers.join(',')].concat(
      source.map((c) => {
        const p = c.payments?.[0];
        return [
          c.first_name,
          c.last_name,
          c.email,
          c.phone,
          c.status,
          c.created_at ? new Date(c.created_at).toISOString().slice(0, 10) : '',
          p?.setup_fee_amount != null ? (p.setup_fee_amount / 100).toFixed(2) : '',
          p?.monthly_amount != null ? (p.monthly_amount / 100).toFixed(2) : '',
          dfrFor(c),
        ]
          .map(escape)
          .join(',');
      })
    );
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clients-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${source.length} row(s).`, 'success');
  };

  const paymentLabel = (c) => {
    const p = c.payments?.[0];
    if (!p) return '—';
    if (p.monthly_status === 'active') return 'Active';
    if (p.setup_fee_status === 'paid') return 'Setup paid';
    return p.monthly_status || '—';
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black text-[#002D5B]">Clients</h1>
          <p className="text-sm text-slate-600">
            Searchable, filterable list with quick status filters and export.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={syncFromGHL}
            disabled={syncing}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {syncing ? 'Syncing…' : 'Sync GHL'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/clients/joint')}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Add joint client
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/clients/new')}
            className="rounded-xl bg-[#2562FF] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1d52d8]"
          >
            Add client
          </button>
        </div>
      </div>

      <AdminCard
        title="Client search"
        actions={
          <button
            type="button"
            className="text-sm font-semibold text-[#2562FF] hover:underline"
            onClick={() =>
              showToast('Use Record search + status chips. Assigned / date filters can be added to schema.', 'info')
            }
          >
            Advanced search
          </button>
        }
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <span className="text-slate-400">⌕</span>
            <input
              className="flex-1 border-0 bg-transparent text-sm outline-none"
              placeholder="Name, email, phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold uppercase text-slate-500">Record search</label>
            <select
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
              value={recordSearch}
              onChange={(e) => setRecordSearch(e.target.value)}
            >
              <option value="all">All fields</option>
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
            </select>
          </div>
        </div>
      </AdminCard>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            statusFilter === 'all' ? 'bg-[#002D5B] text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'
          }`}
        >
          All
        </button>
        {CLIENT_STATUS_FILTERS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              statusFilter === s ? 'bg-[#002D5B] text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <AdminCard
        title="Client results"
        actions={
          <>
            <button
              type="button"
              onClick={exportCsv}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Export CSV
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="rounded-xl bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"
            >
              Dashboard
            </button>
          </>
        }
      >
        {loading ? (
          <p className="text-sm text-slate-500">Loading clients…</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                    <th className="pb-3 pr-2">
                      <input type="checkbox" aria-label="Select page" onChange={toggleAllPage} />
                    </th>
                    <th className="pb-3 pr-4 font-semibold">Client name</th>
                    <th className="pb-3 pr-4 font-semibold">Email</th>
                    <th className="pb-3 pr-4 font-semibold">Assigned</th>
                    <th className="pb-3 pr-4 font-semibold">Date</th>
                    <th className="pb-3 pr-4 font-semibold">Setup fee</th>
                    <th className="pb-3 pr-4 font-semibold">Monthly</th>
                    <th className="pb-3 pr-4 font-semibold">Cycle</th>
                    <th className="pb-3 pr-4 font-semibold">Payment</th>
                    <th className="pb-3 pr-4 font-semibold">Status</th>
                    <th className="pb-3 pr-4 font-semibold">DFR</th>
                    <th className="pb-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pageSlice.map((c) => {
                    const p = c.payments?.[0];
                    return (
                      <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/80">
                        <td className="py-3 pr-2">
                          <input
                            type="checkbox"
                            checked={selected.has(c.id)}
                            onChange={() => toggleRow(c.id)}
                            aria-label={`Select ${c.first_name}`}
                          />
                        </td>
                        <td className="py-3 pr-4 font-medium text-[#002D5B]">
                          {c.first_name} {c.last_name}
                        </td>
                        <td className="max-w-[200px] truncate py-3 pr-4 text-slate-600">{c.email || '—'}</td>
                        <td className="py-3 pr-4 text-slate-600">—</td>
                        <td className="py-3 pr-4 text-slate-500">
                          {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-3 pr-4">
                          {p?.setup_fee_amount != null
                            ? `$${(p.setup_fee_amount / 100).toFixed(2)}`
                            : '—'}
                        </td>
                        <td className="py-3 pr-4">
                          {p?.monthly_amount != null
                            ? `$${(p.monthly_amount / 100).toFixed(2)}`
                            : '—'}
                        </td>
                        <td className="py-3 pr-4 text-slate-600">Monthly</td>
                        <td className="py-3 pr-4 text-slate-600">{paymentLabel(c)}</td>
                        <td className="py-3 pr-4">
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold capitalize text-slate-700">
                            {c.status || 'active'}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-slate-500">{dfrFor(c)}</td>
                        <td className="py-3">
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/clients/${c.id}`)}
                            className="font-semibold text-[#2562FF] hover:underline"
                          >
                            Open
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <span>Rows per page</span>
                <select
                  className="rounded-lg border border-slate-200 px-2 py-1"
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                >
                  {PAGE_SIZES.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <span>
                  {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1}–
                  {Math.min(page * pageSize, filtered.length)} of {filtered.length}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-slate-200 px-3 py-1 disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-lg border border-slate-200 px-3 py-1 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </AdminCard>
    </div>
  );
}
