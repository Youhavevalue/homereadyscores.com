import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { portalFetch } from '../../lib/supabase';
import { useAdminToast } from '../context/AdminToastContext';
import { AdminCard } from '../components/AdminCard';
import { CLIENT_STATUS_FILTERS } from '../constants/hotLinks';

const PAGE_SIZE = 50;

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
  const [appliedSearch, setAppliedSearch] = useState('');
  const [total, setTotal] = useState(0);
  const requestVersion = useRef(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState(() => new Set());
  const [loadError, setLoadError] = useState('');

  const loadClients = useCallback(async () => {
    const version = ++requestVersion.current;
    setLoading(true);
    setLoadError('');
    setSelected(new Set());
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (appliedSearch) params.set('q', appliedSearch);
      if (statusFilter !== 'all') params.set('status', normKey(statusFilter));
      const response = await portalFetch(`/api/clients/list?${params}`);
      const body = await response.json();
      if (version !== requestVersion.current) return;
      if (!response.ok) throw new Error(body.error || 'Client list could not be loaded.');
      if (!Array.isArray(body.clients) || !Number.isSafeInteger(body.total) || body.total < 0 || body.page !== page || body.pageSize !== PAGE_SIZE) {
        throw new Error('Client page could not be confirmed. Please retry.');
      }
      setClients(body.clients);
      setTotal(body.total);
    } catch (error) {
      if (version === requestVersion.current) setLoadError(error.message || 'Client list could not be loaded. Please retry.');
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  }, [page, appliedSearch, statusFilter]);

  useEffect(() => {
    void loadClients();
    return () => { requestVersion.current += 1; };
  }, [loadClients]);

  const submitSearch = (event) => {
    event.preventDefault();
    const nextSearch = search.trim();
    if (page === 0 && nextSearch === appliedSearch) void loadClients();
    else { setPage(0); setAppliedSearch(nextSearch); }
  };
  const changeStatus = (status) => { setPage(0); setStatusFilter(status); };
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageSlice = clients;

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
      selected.size > 0 ? clients.filter((c) => selected.has(c.id)) : clients;
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
      const raw = String(v ?? '');
      const s = /^[=+@\-\t\r]/.test(raw) ? `'${raw}` : raw;
      if (/[\n\r,"]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
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
    a.download = `clients-page-${page + 1}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${source.length} row(s) from the current client page.`, 'success');
  };

  const paymentLabel = (c) => {
    const p = c.payments?.[0];
    if (!p) return '—';
    if (p.monthly_status === 'active') return 'Active';
    if (p.setup_fee_status === 'paid') return 'Setup paid';
    return p.monthly_status || '—';
  };

  return (
    <div className="clients-page mx-auto max-w-[1400px] space-y-6">
      <div className="clients-heading flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black text-[#002D5B]">Clients</h1>
          <p className="text-sm text-slate-600">
            Find client records, check their status, and open the next piece of work.
          </p>
        </div>
        <div className="clients-heading-actions flex flex-wrap gap-2">
          <button type="button" onClick={() => navigate('/admin/clients/new')} className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold">Add single client</button>
          <button type="button" onClick={() => navigate('/admin/clients/joint')} className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold">Add joint clients</button>
          <button type="button" onClick={loadClients} className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold">Reload clients</button>
          <button type="button" onClick={() => navigate('/admin/requests')} className="rounded-xl bg-[#2562FF] px-4 py-2 text-sm font-semibold text-white">Request queue</button>
        </div>
      </div>

      <AdminCard title="Find a client" className="clients-search-card">
        <form onSubmit={submitSearch} className="flex flex-col gap-3 md:flex-row md:items-end">
          <label className="flex-1 text-sm font-semibold text-slate-600">Search first name, last name, email or phone
            <input type="search" name="clientSearch" maxLength={100} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-normal"
              placeholder="Name, email, phone…" value={search} onChange={(event) => setSearch(event.target.value)} />
          </label>
          <button type="submit" disabled={loading} className="rounded-xl bg-[#2562FF] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Search clients</button>
        </form>
        <p className="mt-2 text-xs text-slate-500">Search runs across all clients. Use letters, numbers, spaces, @, period, plus, hyphen or apostrophe.</p>
      </AdminCard>

      <div className="clients-mobile-filter"><label htmlFor="client-status-filter">Client status</label><select id="client-status-filter" value={statusFilter} onChange={(event)=>changeStatus(event.target.value)}><option value="all">All statuses</option>{CLIENT_STATUS_FILTERS.map(status=><option key={status} value={status}>{status}</option>)}</select></div>
      <div className="clients-status-tabs flex flex-wrap gap-2" aria-label="Filter clients by status">
        <button
          type="button"
          onClick={() => changeStatus('all')}
          aria-pressed={statusFilter === 'all'}
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
            onClick={() => changeStatus(s)}
            aria-pressed={statusFilter === s}
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
        className="clients-results-card"
        actions={
          <>
            <button
              type="button"
              onClick={exportCsv}
              disabled={loading || !!loadError}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {selected.size ? 'Export selected on page CSV' : 'Export current page CSV'}
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
        ) : loadError ? (
          <p role="alert" className="rounded bg-red-50 p-3 text-red-800">{loadError} The client list has not been assumed empty.</p>
        ) : (
          <>
            <p className="mb-3 text-xs text-slate-500">50 clients per page. CSV export includes only this page or its selected rows. GHL sync, payment editing and new client activation are paused.</p>
            {!clients.length && <p className="mb-3 text-sm text-slate-500">No clients on this page match the current search and status filter.</p>}
            <div className="clients-selection-summary"><p>{selected.size} selected on this page</p><label className="clients-mobile-select"><input type="checkbox" aria-label="Select all clients on this page" checked={pageSlice.length>0&&pageSlice.every(c=>selected.has(c.id))} onChange={toggleAllPage}/>Select page</label></div>
            <div className="clients-mobile-list">{pageSlice.map(c=>{const payment=c.payments?.[0];return <article key={c.id} className={'client-mobile-card'+(selected.has(c.id)?' client-mobile-card-selected':'')}><div className="client-mobile-card-heading"><label><input type="checkbox" checked={selected.has(c.id)} onChange={()=>toggleRow(c.id)} aria-label={`Select ${c.first_name} ${c.last_name} on mobile`}/><span>{c.first_name} {c.last_name}</span></label><span className="client-status-chip">{c.status||'Status not recorded'}</span></div><p className="client-mobile-contact">{c.email||'Email not recorded'}</p><p className="client-mobile-contact">{c.phone||'Phone not recorded'}</p><dl className="client-mobile-summary"><div><dt>Assigned</dt><dd>{c.assigned_to||'Unassigned'}</dd></div><div><dt>Added</dt><dd>{c.created_at?new Date(c.created_at).toLocaleDateString():'Not recorded'}</dd></div><div><dt>Results due in</dt><dd>{dfrFor(c)==='—'?'Not recorded':`${dfrFor(c)} days`}</dd></div><div><dt>Payment</dt><dd>{paymentLabel(c)==='—'?'Not recorded':paymentLabel(c)}</dd></div></dl><details className="client-mobile-billing"><summary>Stored billing amounts</summary><dl><div><dt>Setup fee</dt><dd>{payment?.setup_fee_amount!=null?`$${(payment.setup_fee_amount/100).toFixed(2)}`:'Not recorded'}</dd></div><div><dt>Monthly amount</dt><dd>{payment?.monthly_amount!=null?`$${(payment.monthly_amount/100).toFixed(2)}`:'Not recorded'}</dd></div></dl></details><button type="button" onClick={()=>navigate(`/admin/clients/${c.id}`)}>Open client</button></article>;})}</div>
            <div className="clients-desktop-table overflow-x-auto" role="region" aria-label="Client results table" tabIndex={0}>
              <table className="w-full min-w-[960px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                    <th className="pb-3 pr-2">
                      <input type="checkbox" aria-label="Select page" checked={pageSlice.length>0&&pageSlice.every(c=>selected.has(c.id))} onChange={toggleAllPage} />
                    </th>
                    <th className="pb-3 pr-4 font-semibold">Client name</th>
                    <th className="pb-3 pr-4 font-semibold">Email</th>
                    <th className="pb-3 pr-4 font-semibold">Assigned</th>
                    <th className="pb-3 pr-4 font-semibold">Date</th>
                    <th className="pb-3 pr-4 font-semibold">Setup fee</th>
                    <th className="pb-3 pr-4 font-semibold">Monthly</th>
                    <th className="pb-3 pr-4 font-semibold">Payment</th>
                    <th className="pb-3 pr-4 font-semibold">Status</th>
                    <th className="pb-3 pr-4 font-semibold"><abbr title="Days until expected results">DFR</abbr></th>
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
                        <td className="py-3 pr-4 text-slate-600">{c.assigned_to || '—'}</td>
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
                        <td className="py-3 pr-4 text-slate-600">{paymentLabel(c)}</td>
                        <td className="py-3 pr-4">
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold capitalize text-slate-700">
                            {c.status || 'Status not recorded'}
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

            <div className="clients-pagination mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <span>Showing {clients.length ? page * PAGE_SIZE + 1 : 0}–{clients.length ? page * PAGE_SIZE + clients.length : 0} of {total} clients · Page {page + 1} of {totalPages}</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={loading || page <= 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="rounded-lg border border-slate-200 px-3 py-1 disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  type="button"
                  disabled={loading || page >= totalPages - 1}
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
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
