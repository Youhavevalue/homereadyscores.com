import AdminSimplePage, { AdminPlaceholderTable } from './AdminSimplePage';
import { AdminCard } from '../components/AdminCard';

export function ContractsPage() {
  return (
    <AdminSimplePage title="Contract management" subtitle="Client agreements and e-sign placeholders.">
      <AdminPlaceholderTable columns={['Client', 'Contract', 'Signed']} />
    </AdminSimplePage>
  );
}

export function InvoicesPage() {
  return (
    <AdminSimplePage title="Invoices" subtitle="Invoice generation and history.">
      <AdminPlaceholderTable columns={['Invoice #', 'Client', 'Amount', 'Status']} />
    </AdminSimplePage>
  );
}

const SETTINGS_SECTIONS = [
  ['Company settings', 'Profile, legal name, support contacts.'],
  ['Company emails', 'From addresses and signatures.'],
  ['Account specs', 'Plan types and feature flags.'],
  ['Customize system', 'Labels, defaults, and modules.'],
  ['Round robin', 'Lead rotation among counselors.'],
  ['Company skin', 'Branding, colors, and client portal theme.'],
];

export function SettingsPage() {
  return (
    <AdminSimplePage
      title="System settings"
      subtitle="Company, email, specs, customization, round robin, and skin."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {SETTINGS_SECTIONS.map(([title, desc]) => (
          <AdminCard key={title} title={title}>
            <p className="text-sm text-slate-600">{desc}</p>
            <button
              type="button"
              className="mt-3 text-sm font-semibold text-[#2562FF] hover:underline"
            >
              Configure
            </button>
          </AdminCard>
        ))}
      </div>
    </AdminSimplePage>
  );
}

const EMAIL_GROUPS = [
  'Add preformatted email',
  'Standard emails',
  'Preformatted broker emails',
  'Preformatted sales emails',
];

export function SystemEmailsPage() {
  return (
    <AdminSimplePage title="System emails" subtitle="Template library for operational messaging.">
      <div className="space-y-4">
        {EMAIL_GROUPS.map((g) => (
          <AdminCard key={g} title={g}>
            <AdminPlaceholderTable columns={['Template', 'Audience', 'Actions']} rows={3} />
          </AdminCard>
        ))}
      </div>
    </AdminSimplePage>
  );
}

export function UsersPage() {
  return (
    <AdminSimplePage
      title="Users"
      subtitle="Staff accounts, roles, and permissions."
      actions={
        <button
          type="button"
          className="rounded-xl bg-[#2562FF] px-4 py-2 text-sm font-semibold text-white"
          onClick={() => alert('Invite user')}
        >
          Add user
        </button>
      }
    >
      <AdminPlaceholderTable columns={['Name', 'Email', 'Role', 'Actions']} />
    </AdminSimplePage>
  );
}

const REPORTS = [
  ['Closing ratio', 'Conversion from prospect to funded client.'],
  ['Note ratio', 'Counselor notes per active account.'],
  ['Affiliate referral report', 'Partner attribution.'],
  ['Broker referral report', 'Broker pipeline.'],
  ['Broker creation report', 'New broker onboarding.'],
];

export function ReportsPage() {
  return (
    <AdminSimplePage title="Reports" subtitle="Operational and partner analytics.">
      <div className="grid gap-4 md:grid-cols-2">
        {REPORTS.map(([title, desc]) => (
          <AdminCard key={title} title={title}>
            <p className="text-sm text-slate-600">{desc}</p>
            <button
              type="button"
              className="mt-3 rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white"
            >
              Run report
            </button>
          </AdminCard>
        ))}
      </div>
    </AdminSimplePage>
  );
}

export function CommunicationPage() {
  return (
    <AdminSimplePage
      title="Communication"
      subtitle="Profile, phone numbers, and message center."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <AdminCard title="Profile">
          <p className="text-sm text-slate-600">Team sender profile for outbound comms.</p>
        </AdminCard>
        <AdminCard title="Phone numbers">
          <AdminPlaceholderTable columns={['Number', 'Label', 'Actions']} rows={2} />
        </AdminCard>
        <AdminCard title="Messages">
          <p className="text-sm text-slate-600">Aggregate SMS / email log.</p>
        </AdminCard>
      </div>
    </AdminSimplePage>
  );
}
