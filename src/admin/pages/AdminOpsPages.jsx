import { Link } from 'react-router-dom';
import AdminSimplePage, { AdminPlaceholderTable } from './AdminSimplePage';
import { AdminCard } from '../components/AdminCard';

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
        <button type="button" className="mt-3 rounded-xl bg-[#002D5B] px-4 py-2 text-sm font-semibold text-white">
          Save FAQ
        </button>
      </AdminCard>
    </AdminSimplePage>
  );
}

export function HelpDeskPage() {
  return (
    <AdminSimplePage
      title="Help desk — open tickets"
      subtitle="Ticket IDs, status, subject, and timestamps."
      actions={
        <Link to="/admin/help-desk/all" className="text-sm font-semibold text-[#2562FF] hover:underline">
          View all tickets
        </Link>
      }
    >
      <AdminPlaceholderTable columns={['Ticket ID', 'Status', 'Subject', 'When logged']} rows={6} />
    </AdminSimplePage>
  );
}

export function HelpDeskAllPage() {
  return (
    <AdminSimplePage title="All tickets" subtitle="Open and closed history.">
      <AdminPlaceholderTable columns={['Ticket ID', 'Status', 'Subject', 'When logged']} rows={8} />
    </AdminSimplePage>
  );
}

export function AppointmentsPage() {
  return (
    <AdminSimplePage
      title="Appointments"
      subtitle="Scheduling and follow-ups — integrates with client profile “Set follow-up”."
    >
      <AdminCard title="Calendar">
        <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-300 text-sm text-slate-500">
          Calendar / scheduling UI — connect Google Calendar or internal scheduler.
        </div>
      </AdminCard>
    </AdminSimplePage>
  );
}
