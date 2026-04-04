import { Link } from 'react-router-dom';
import AdminSimplePage, { AdminPlaceholderTable } from './AdminSimplePage';
import { AdminCard } from '../components/AdminCard';

export function ProspectsPage() {
  return (
    <AdminSimplePage
      title="Prospects"
      subtitle="Searchable list of leads before conversion to clients."
      actions={
        <Link
          to="/admin/prospects/new"
          className="rounded-xl bg-[#2562FF] px-4 py-2 text-sm font-semibold text-white"
        >
          Add prospect
        </Link>
      }
    >
      <AdminPlaceholderTable columns={['Name', 'Email', 'Source', 'Actions']} />
    </AdminSimplePage>
  );
}

export function ProspectNewPage() {
  return (
    <AdminSimplePage title="Add prospect" subtitle="Capture lead details and trigger prospect autoresponders.">
      <AdminCard title="Prospect form">
        <div className="grid gap-3 md:grid-cols-2">
          {['First name', 'Last name', 'Email', 'Phone'].map((ph) => (
            <input
              key={ph}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder={ph}
            />
          ))}
        </div>
        <button
          type="button"
          className="mt-4 rounded-xl bg-[#002D5B] px-4 py-2 text-sm font-semibold text-white"
          onClick={() => alert('Insert into prospects table')}
        >
          Save prospect
        </button>
      </AdminCard>
    </AdminSimplePage>
  );
}

export function AffiliatesPage() {
  return (
    <AdminSimplePage
      title="Affiliates"
      subtitle="Partner accounts and referral attribution."
      actions={
        <div className="flex gap-2">
          <Link
            to="/admin/affiliates/referrals"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold"
          >
            Referral report
          </Link>
          <Link
            to="/admin/affiliates/new"
            className="rounded-xl bg-[#2562FF] px-4 py-2 text-sm font-semibold text-white"
          >
            Add affiliate
          </Link>
        </div>
      }
    >
      <AdminPlaceholderTable columns={['Affiliate', 'Code', 'Clients', 'Actions']} />
    </AdminSimplePage>
  );
}

export function AffiliateNewPage() {
  return (
    <AdminSimplePage title="Add affiliate" subtitle="Create affiliate portal access and tracking codes.">
      <AdminCard title="Affiliate profile">
        <div className="grid gap-3 md:grid-cols-2">
          <input className="rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="Company / name" />
          <input className="rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="Referral code" />
          <input className="md:col-span-2 rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="Email" />
        </div>
        <button
          type="button"
          className="mt-4 rounded-xl bg-[#2562FF] px-4 py-2 text-sm font-semibold text-white"
          onClick={() => alert('Save affiliate')}
        >
          Save
        </button>
      </AdminCard>
    </AdminSimplePage>
  );
}

export function AffiliateReferralsPage() {
  return (
    <AdminSimplePage
      title="Affiliate referral report"
      subtitle="Closing metrics and payouts by affiliate."
    >
      <AdminPlaceholderTable columns={['Affiliate', 'Referrals', 'Funded', 'Revenue']} />
    </AdminSimplePage>
  );
}

export function BrokersPage() {
  return (
    <AdminSimplePage
      title="Brokers"
      subtitle="Mortgage broker partners and referral pipeline."
      actions={
        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/brokers/global"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold"
          >
            Global view
          </Link>
          <Link
            to="/admin/brokers/referrals"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold"
          >
            Referral report
          </Link>
          <Link
            to="/admin/brokers/creation-report"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold"
          >
            Creation report
          </Link>
          <Link
            to="/admin/brokers/new"
            className="rounded-xl bg-[#2562FF] px-3 py-2 text-sm font-semibold text-white"
          >
            Add broker
          </Link>
        </div>
      }
    >
      <AdminPlaceholderTable columns={['Broker', 'NMLS', 'Referrals', 'Actions']} />
    </AdminSimplePage>
  );
}

export function BrokerNewPage() {
  return (
    <AdminSimplePage title="Add broker">
      <AdminCard title="Broker profile">
        <div className="grid gap-3 md:grid-cols-2">
          <input className="rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="Brokerage name" />
          <input className="rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="NMLS #" />
        </div>
        <button type="button" className="mt-4 rounded-xl bg-[#2562FF] px-4 py-2 text-sm font-semibold text-white">
          Save broker
        </button>
      </AdminCard>
    </AdminSimplePage>
  );
}

export function BrokerGlobalPage() {
  return (
    <AdminSimplePage title="Broker global view" subtitle="All brokers at a glance.">
      <AdminPlaceholderTable columns={['Broker', 'Active clients', 'Pipeline']} />
    </AdminSimplePage>
  );
}

export function BrokerReferralReportPage() {
  return (
    <AdminSimplePage title="Broker referral report">
      <AdminPlaceholderTable columns={['Broker', 'Referrals', 'Status']} />
    </AdminSimplePage>
  );
}

export function BrokerCreationReportPage() {
  return (
    <AdminSimplePage title="Broker creation report">
      <AdminPlaceholderTable columns={['Broker', 'Created', 'Source']} />
    </AdminSimplePage>
  );
}
