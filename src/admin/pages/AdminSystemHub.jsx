import { Link } from 'react-router-dom';
import { adminHubLinks } from '../navConfig';

export default function AdminSystemHub() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-black text-[#002D5B]">System admin</h1>
        <p className="mt-1 text-sm text-slate-600">
          Contracts, invoices, settings, users, reports, communication, and shortcuts — LegacyCredits-style hub.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {adminHubLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="group flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#2562FF]/40 hover:shadow-md"
            >
              <div className="rounded-xl bg-slate-100 p-2 text-[#002D5B] group-hover:bg-[#2562FF]/10">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="font-display font-bold text-[#002D5B]">{item.label}</div>
                <div className="mt-1 text-xs text-slate-500">{item.to}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
