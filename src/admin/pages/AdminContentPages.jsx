import AdminSimplePage, { AdminPlaceholderTable } from './AdminSimplePage';
import { AdminCard } from '../components/AdminCard';
import { BUREAU_LETTER_ROUNDS } from '../constants/letterRounds';

const CMS_PAGES = [
  'Home',
  'Affiliate',
  'Terms',
  'Things To Know',
  'Contact',
  'Start Now',
  'Thanks',
  'Client portal — Watch',
  'Client portal — Referrals',
  'Broker portal — Referrals',
];

export function CMSPage() {
  return (
    <AdminSimplePage
      title="Web CMS"
      subtitle="Public site and portal pages with optional CSS editor."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <AdminCard
          title="Pages"
          actions={
            <button type="button" className="text-sm font-semibold text-[#2562FF]">
              Create page
            </button>
          }
        >
          <ul className="space-y-2">
            {CMS_PAGES.map((p) => (
              <li
                key={p}
                className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm"
              >
                <span>{p}</span>
                <button type="button" className="text-xs font-semibold text-[#2562FF]">
                  Edit
                </button>
              </li>
            ))}
          </ul>
        </AdminCard>
        <AdminCard title="CSS editor">
          <textarea
            className="min-h-[220px] w-full rounded-xl border border-slate-200 p-3 font-mono text-xs"
            placeholder="/* Global portal + marketing overrides */"
          />
          <button type="button" className="mt-3 rounded-xl bg-[#002D5B] px-4 py-2 text-sm font-semibold text-white">
            Save CSS
          </button>
        </AdminCard>
      </div>
    </AdminSimplePage>
  );
}

export function LettersHubPage() {
  return (
    <AdminSimplePage
      title="Letter system"
      subtitle="Bureau rounds, creditor letters, and creditor index — see also client profile Letters tab."
    >
      <AdminCard title="Bureau letter rounds (library)">
        <ul className="max-h-64 space-y-1 overflow-auto text-sm">
          {BUREAU_LETTER_ROUNDS.map((r) => (
            <li key={r} className="flex justify-between rounded-lg bg-slate-50 px-2 py-1">
              <span>{r}</span>
              <button type="button" className="text-xs text-[#2562FF]">
                Open
              </button>
            </li>
          ))}
        </ul>
      </AdminCard>
      <AdminPlaceholderTable columns={['Creditor', 'Letters', 'Load']} />
    </AdminSimplePage>
  );
}

export function LetterMenuPage() {
  return (
    <AdminSimplePage title="Letter menu" subtitle="Administrative shortcuts to template groups.">
      <AdminPlaceholderTable columns={['Group', 'Templates', 'Actions']} />
    </AdminSimplePage>
  );
}

export function HotlinksPage() {
  return (
    <AdminSimplePage title="Hotlinks" subtitle="Configurable quick-action links for staff.">
      <AdminCard title="Hotlinks">
        <div className="flex flex-wrap gap-2">
          {['Processor', 'Bureau portal', 'Clover', 'SMS console'].map((h) => (
            <button
              key={h}
              type="button"
              className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium hover:bg-slate-200"
            >
              {h}
            </button>
          ))}
        </div>
      </AdminCard>
    </AdminSimplePage>
  );
}
