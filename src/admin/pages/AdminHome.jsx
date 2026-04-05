import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminCard } from '../components/AdminCard';
import { supabase } from '../../lib/supabase';
import { fetchHelpTickets } from '../lib/adminData';

function formatWhen(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function AdminHome() {
  const navigate = useNavigate();
  const [dashQ, setDashQ] = useState('');
  const [ticketTab, setTicketTab] = useState('open');
  const [stats, setStats] = useState({ clients: 0, openDisputes: 0, appointments: 0 });
  const [ticketRows, setTicketRows] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const [c, dl, ap] = await Promise.all([
          supabase.from('clients').select('*', { count: 'exact', head: true }),
          supabase.from('dispute_letters').select('status'),
          supabase
            .from('scheduled_charges')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending')
            .eq('scheduled_date', today),
        ]);
        const closed = new Set(['resolved', 'deleted']);
        const openD =
          dl.data?.filter((d) => !closed.has((d.status || '').toLowerCase())).length ?? 0;
        setStats({
          clients: c.count ?? 0,
          openDisputes: openD,
          appointments: ap.count ?? 0,
        });
      } catch {
        /* ignore */
      }
    })();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setTicketsLoading(true);
      try {
        const status =
          ticketTab === 'resolved' ? 'closed' : ticketTab === 'open' ? 'open' : 'all';
        const rows = await fetchHelpTickets({
          status: ticketTab === 'new' ? 'open' : status,
          limit: ticketTab === 'new' ? 4 : 50,
        });
        if (!cancelled) setTicketRows(rows);
      } catch {
        if (!cancelled) setTicketRows([]);
      } finally {
        if (!cancelled) setTicketsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ticketTab]);

  const filteredTickets = useMemo(() => {
    const q = dashQ.toLowerCase().trim();
    if (!q) return ticketRows;
    return ticketRows.filter(
      (t) =>
        (t.subject || '').toLowerCase().includes(q) ||
        (t.ticket_number || '').toLowerCase().includes(q)
    );
  }, [ticketRows, dashQ]);

  return (
    <div className="mx-auto max-w-6xl space-y-8 duration-300 animate-in fade-in">
      <div>
        <h1 className="font-display text-2xl font-black tracking-tight text-[#002D5B] md:text-3xl">
          Home
        </h1>
        <p className="mt-1 text-slate-600">
          Operations overview, support queue, and quick search.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <label className="sr-only" htmlFor="dash-search">
          Search dashboard and tickets
        </label>
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <span className="text-lg text-slate-400" aria-hidden>
            ⌕
          </span>
          <input
            id="dash-search"
            className="flex-1 border-0 bg-transparent text-base outline-none placeholder:text-slate-400"
            placeholder="Filter tickets below by subject or ID…"
            value={dashQ}
            onChange={(e) => setDashQ(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Total clients', value: stats.clients, tone: 'from-[#2562FF] to-[#0078C1]' },
          { label: 'Open disputes', value: stats.openDisputes, tone: 'from-amber-500 to-orange-500' },
          { label: 'Appointments today', value: stats.appointments, tone: 'from-emerald-500 to-teal-600' },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div
              className={`mb-3 inline-flex rounded-lg bg-gradient-to-br ${s.tone} px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white`}
            >
              Live
            </div>
            <div className="font-display text-3xl font-black text-[#002D5B]">{s.value}</div>
            <div className="text-sm text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      <AdminCard
        title="Support Desk"
        subtitle="Ticket ID, status, subject, and time logged"
        actions={
          <button
            type="button"
            onClick={() => navigate('/admin/help-desk')}
            className="rounded-xl bg-[#2562FF] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1d52d8]"
          >
            Manage tickets
          </button>
        }
      >
        <div className="mb-4 flex flex-wrap gap-2 border-b border-slate-100 pb-3">
          {[
            { id: 'new', label: 'Recent open' },
            { id: 'open', label: 'All open' },
            { id: 'resolved', label: 'Closed' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTicketTab(t.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                ticketTab === t.id
                  ? 'bg-[#002D5B] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {ticketsLoading ? (
          <div className="space-y-3 py-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 py-12 text-center text-sm text-slate-500">
            No tickets yet. Run <code className="rounded bg-white px-1.5 py-0.5 text-xs">sql/admin_operational_migration.sql</code>{' '}
            in Supabase, then create tickets from Help Desk.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                  <th className="pb-3 pr-4 font-semibold">Ticket ID</th>
                  <th className="pb-3 pr-4 font-semibold">Status</th>
                  <th className="pb-3 pr-4 font-semibold">Subject</th>
                  <th className="pb-3 font-semibold">When logged</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((row) => (
                  <tr key={row.id} className="border-b border-slate-50 last:border-0">
                    <td className="py-3 pr-4 font-mono text-xs text-[#2562FF]">
                      {row.ticket_number || row.id?.slice(0, 8)}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                          row.status === 'open'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-slate-700">{row.subject}</td>
                    <td className="py-3 text-slate-500">{formatWhen(row.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </div>
  );
}
