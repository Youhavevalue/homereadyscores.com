import { useParams, Link } from 'react-router-dom';
import AdminSimplePage, { AdminPlaceholderTable } from './AdminSimplePage';
import { AdminCard } from '../components/AdminCard';

const TYPES = [
  { key: 'prospect', label: 'Prospect' },
  { key: 'broker', label: 'Broker' },
  { key: 'client', label: 'Client' },
];

export default function AdminAutorespondersPage() {
  const { type } = useParams();
  const active = TYPES.find((t) => t.key === type) || TYPES[0];

  return (
    <AdminSimplePage
      title="Autoresponders"
      subtitle="Triggered sequences by audience — add and edit email steps."
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <Link
            key={t.key}
            to={`/admin/autoresponders/${t.key}`}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
              active.key === t.key ? 'bg-[#002D5B] text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>
      <AdminCard
        title={`${active.label} sequences`}
        actions={
          <button type="button" className="text-sm font-semibold text-[#2562FF]">
            Add email
          </button>
        }
      >
        <AdminPlaceholderTable columns={['Step', 'Subject', 'Delay', 'Actions']} rows={4} />
      </AdminCard>
    </AdminSimplePage>
  );
}
