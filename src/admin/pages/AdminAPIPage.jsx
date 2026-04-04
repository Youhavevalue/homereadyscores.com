import { useParams, Link } from 'react-router-dom';
import AdminSimplePage from './AdminSimplePage';
import { AdminCard } from '../components/AdminCard';

const TABS = [
  { key: 'deferred', label: 'Deferred subscriptions' },
  { key: 'config', label: 'Config' },
  { key: 'credentials', label: 'My API credentials' },
];

export default function AdminAPIPage() {
  const { section } = useParams();
  const key = section && TABS.some((t) => t.key === section) ? section : 'deferred';

  return (
    <AdminSimplePage
      title="API & integrations"
      subtitle="Deferred billing, API configuration, and credential management."
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.key}
            to={`/admin/api/${t.key}`}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
              key === t.key ? 'bg-[#002D5B] text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {key === 'deferred' && (
        <AdminCard title="Deferred subscriptions">
          <p className="text-sm text-slate-600">
            Queue and manage subscriptions that start after a future date (e.g. post-closing).
          </p>
          <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
            No deferred subscriptions.
          </div>
        </AdminCard>
      )}

      {key === 'config' && (
        <AdminCard title="API configuration">
          <label className="text-sm font-semibold text-slate-700">Webhook URL</label>
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            placeholder="https://…"
          />
          <button
            type="button"
            className="mt-4 rounded-xl bg-[#2562FF] px-4 py-2 text-sm font-semibold text-white"
          >
            Save
          </button>
        </AdminCard>
      )}

      {key === 'credentials' && (
        <AdminCard title="API credentials">
          <p className="text-sm text-slate-600">Rotate keys and scope access for integrations.</p>
          <div className="mt-4 rounded-xl bg-slate-50 p-4 font-mono text-xs text-slate-600">
            hrs_live_••••••••••••••••
          </div>
          <button type="button" className="mt-3 text-sm font-semibold text-[#2562FF]">
            Regenerate
          </button>
        </AdminCard>
      )}
    </AdminSimplePage>
  );
}
