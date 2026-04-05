import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminSimplePage, { AdminPlaceholderTable } from './AdminSimplePage';
import { AdminCard } from '../components/AdminCard';
import { useAuth } from '../../context/AuthContext';
import { useAdminToast } from '../context/AdminToastContext';
import {
  fetchHelpTickets,
  createHelpTicket,
  updateTicketStatus,
} from '../lib/adminData';

function formatWhen(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function TicketTable({ rows, onToggleStatus, showActions }) {
  if (!rows?.length) {
    return (
      <p className="py-8 text-center text-sm text-slate-500">
        No tickets. Create one below, or run the SQL migration if the table is missing.
      </p>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
            <th className="pb-3 pr-4 font-semibold">Ticket ID</th>
            <th className="pb-3 pr-4 font-semibold">Status</th>
            <th className="pb-3 pr-4 font-semibold">Subject</th>
            <th className="pb-3 pr-4 font-semibold">When logged</th>
            {showActions && <th className="pb-3 font-semibold">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-slate-50 last:border-0">
              <td className="py-3 pr-4 font-mono text-xs text-[#2562FF]">
                {row.ticket_number || row.id?.slice(0, 8)}
              </td>
              <td className="py-3 pr-4">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                    row.status === 'open' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {row.status}
                </span>
              </td>
              <td className="max-w-md py-3 pr-4 text-slate-700">{row.subject}</td>
              <td className="py-3 pr-4 text-slate-500">{formatWhen(row.created_at)}</td>
              {showActions && (
                <td className="py-3">
                  <button
                    type="button"
                    className="text-xs font-semibold text-[#2562FF] hover:underline"
                    onClick={() => onToggleStatus(row)}
                  >
                    {row.status === 'open' ? 'Close' : 'Reopen'}
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FAQAdminPage() {
  return (
    <AdminSimplePage
      title="FAQ management"
      subtitle="Standalone FAQ editor for public and portal help content."
    >
      <AdminCard title="Questions">
        <textarea
          className="min-h-[200px] w-full rounded-xl border border-slate-200 p-3 text-sm"
          placeholder="Markdown or HTML FAQ blocks…"
        />
        <button
          type="button"
          className="mt-3 rounded-xl bg-[#002D5B] px-4 py-2 text-sm font-semibold text-white"
        >
          Save FAQ
        </button>
      </AdminCard>
    </AdminSimplePage>
  );
}

export function HelpDeskPage() {
  const { user } = useAuth();
  const { showToast } = useAdminToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchHelpTickets({ status: 'open', limit: 100 });
      setRows(data);
    } catch {
      setRows([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    const t = setTimeout(() => void load(), 0);
    return () => clearTimeout(t);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!subject.trim()) {
      showToast('Enter a subject.', 'error');
      return;
    }
    try {
      await createHelpTicket({
        subject: subject.trim(),
        body: body.trim(),
        createdById: user?.id || null,
      });
      showToast('Ticket created.', 'success');
      setSubject('');
      setBody('');
      await load();
    } catch (err) {
      showToast(err.message || 'Could not create ticket. Run sql/admin_operational_migration.sql.', 'error');
    }
  };

  const toggle = async (row) => {
    try {
      await updateTicketStatus(row.id, row.status === 'open' ? 'closed' : 'open');
      showToast(row.status === 'open' ? 'Ticket closed.' : 'Ticket reopened.', 'success');
      await load();
    } catch (err) {
      showToast(err.message || 'Update failed', 'error');
    }
  };

  return (
    <AdminSimplePage
      title="Help desk"
      subtitle="Open tickets — create, triage, and close."
      actions={
        <Link
          to="/admin/help-desk/all"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          All tickets
        </Link>
      }
    >
      <AdminCard title="New ticket">
        <form onSubmit={submit} className="grid gap-3 md:grid-cols-2">
          <label className="md:col-span-2 text-sm font-medium text-slate-700">
            Subject
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief description"
            />
          </label>
          <label className="md:col-span-2 text-sm font-medium text-slate-700">
            Details
            <textarea
              className="mt-1 min-h-[100px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What does the team need to know?"
            />
          </label>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="rounded-xl bg-[#2562FF] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1d52d8]"
            >
              Submit ticket
            </button>
          </div>
        </form>
      </AdminCard>

      <AdminCard title="Open tickets">
        {loading ? (
          <div className="space-y-2 py-6">
            <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
          </div>
        ) : (
          <TicketTable rows={rows} onToggleStatus={toggle} showActions />
        )}
      </AdminCard>
    </AdminSimplePage>
  );
}

export function HelpDeskAllPage() {
  const { showToast } = useAdminToast();
  const [filter, setFilter] = useState('all');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchHelpTickets({
        status: filter === 'all' ? 'all' : filter,
        limit: 200,
      });
      setRows(data);
    } catch {
      setRows([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    const t = setTimeout(() => void load(), 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load is stable; refetch when filter changes
  }, [filter]);

  const toggle = async (row) => {
    try {
      await updateTicketStatus(row.id, row.status === 'open' ? 'closed' : 'open');
      showToast('Updated.', 'success');
      await load();
    } catch (err) {
      showToast(err.message || 'Update failed', 'error');
    }
  };

  return (
    <AdminSimplePage
      title="All tickets"
      subtitle="Full history — filter by status."
      actions={
        <Link to="/admin/help-desk" className="text-sm font-semibold text-[#2562FF] hover:underline">
          ← Open queue
        </Link>
      }
    >
      <AdminCard
        title="Tickets"
        actions={
          <div className="flex gap-1">
            {['all', 'open', 'closed'].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                  filter === f ? 'bg-[#002D5B] text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        }
      >
        {loading ? (
          <div className="h-32 animate-pulse rounded-xl bg-slate-100" />
        ) : (
          <TicketTable rows={rows} onToggleStatus={toggle} showActions />
        )}
      </AdminCard>
    </AdminSimplePage>
  );
}

export function AppointmentsPage() {
  return (
    <AdminSimplePage
      title="Appointments"
      subtitle="Scheduling and follow-ups — ties to scheduled charges in Supabase."
    >
      <AdminCard title="Calendar">
        <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-300 text-center text-sm text-slate-500">
          Use scheduled charges and client follow-up dates. Connect a calendar provider when ready.
        </div>
      </AdminCard>
      <AdminPlaceholderTable columns={['Client', 'Date', 'Type', 'Actions']} rows={3} />
    </AdminSimplePage>
  );
}
