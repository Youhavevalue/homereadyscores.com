import { AdminCard } from '../components/AdminCard';

/**
 * Consistent shell for settings-style admin pages.
 */
export default function AdminSimplePage({
  title,
  subtitle,
  children,
  actions,
}) {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black text-[#002D5B]">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}

export function AdminPlaceholderTable({ columns = ['Name', 'Updated', 'Actions'], rows = 5 }) {
  return (
    <AdminCard title="Records">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs uppercase text-slate-500">
              {columns.map((c) => (
                <th key={c} className="pb-2 pr-4 font-semibold">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i} className="border-b border-slate-50">
                {columns.map((col, j) => (
                  <td key={col} className="py-3 pr-4 text-slate-400">
                    {j === columns.length - 1 ? (
                      <button type="button" className="text-xs font-semibold text-[#2562FF]">
                        Edit
                      </button>
                    ) : (
                      '—'
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-slate-400">
        Connect this view to Supabase tables when you are ready to go live.
      </p>
    </AdminCard>
  );
}
