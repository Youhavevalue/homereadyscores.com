import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminCard } from '../components/AdminCard';
import { supabase } from '../../lib/supabase';

const MOCK_TICKETS = [
  { id: 'HD-10421', status: 'Open', subject: 'Question about dispute timeline', when: '2026-04-03 9:12' },
  { id: 'HD-10418', status: 'Open', subject: 'Portal login issue', when: '2026-04-02 14:40' },
  { id: 'HD-10402', status: 'Resolved', subject: 'Updated payment method', when: '2026-04-01 11:05' },
  { id: 'HD-10388', status: 'Open', subject: 'Document upload failed', when: '2026-03-31 16:22' },
];

export default function AdminHome() {
  const navigate = useNavigate();
  const [dashQ, setDashQ] = useState('');
  const [ticketTab, setTicketTab] = useState('new');
  const [stats, setStats] = useState({ clients: 0, openDisputes: 0, appointments: 0 });

  useEffect(() => {
    (async () => {
      try {
        const [c, d] = await Promise.all([
          supabase.from('clients').select('*', { count: 'exact', head: true }),
          supabase.from('dispute_letters').select('*', { count: 'exact', head: true }).neq('status', 'completed'),
        ]);
        setStats({
          clients: c.count ?? 0,
          openDisputes: d.count ?? 0,
          appointments: 0,
        });
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const tickets = useMemo(() => {
    if (ticketTab === 'new') return MOCK_TICKETS.filter((t) => t.status === 'Open').slice(0, 4);
    if (ticketTab === 'open') return MOCK_TICKETS.filter((t) => t.status === 'Open');
    return MOCK_TICKETS.filter((t) => t.status === 'Resolved');
  }, [ticketTab]);

  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="font-display text-2xl font-black tracking-tight text-[#002D5B] md:text-3xl">
          Home
        </h1>
        <p className="mt-1 text-slate-600">
          Search, support queue, and shortcuts — aligned with your LegacyCredits-style workflow.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <label className="sr-only" htmlFor="dash-search">
          Start typing if you have any questions
        </label>
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <span className="text-lg text-slate-400">⌕</span>
          <input
            id="dash-search"
            className="flex-1 border-0 bg-transparent text-base outline-none placeholder:text-slate-400"
            placeholder="Start typing if you have any questions…"
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
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
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
        subtitle="Recent tickets — columns: Ticket ID, Status, Subject, When Logged"
        actions={
          <button
            type="button"
            onClick={() => navigate('/admin/help-desk')}
            className="rounded-xl bg-[#2562FF] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d52d8]"
          >
            Show all tickets
          </button>
        }
      >
        <div className="mb-4 flex gap-2 border-b border-slate-100 pb-3">
          {[
            { id: 'new', label: 'New ticket' },
            { id: 'open', label: 'Open requests' },
            { id: 'resolved', label: 'Resolved requests' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTicketTab(t.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                ticketTab === t.id
                  ? 'bg-[#002D5B] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

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
              {tickets.map((row) => (
                <tr key={row.id} className="border-b border-slate-50 last:border-0">
                  <td className="py-3 pr-4 font-mono text-xs text-[#2562FF]">{row.id}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        row.status === 'Open'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-slate-700">{row.subject}</td>
                  <td className="py-3 text-slate-500">{row.when}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-slate-400">
          Ticket rows are demo data; connect `help_tickets` in Supabase to go live.
        </p>
      </AdminCard>
    </div>
  );
}
