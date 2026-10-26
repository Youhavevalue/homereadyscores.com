import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { portalFetch } from '../../lib/supabase';
import { AdminCard } from '../components/AdminCard';
import AnalyticsDashboard from '../components/AnalyticsDashboard';

const INQUIRY_STATUSES = [
  ['pending_manual_review', 'Pending manual review'], ['contact_scheduled', 'Contact scheduled'],
  ['agreement_hold', 'Agreement hold'], ['secure_intake_pending', 'Secure intake pending'],
  ['closed', 'Closed'], ['other', 'Other recorded status'], ['not_recorded', 'Not recorded'],
];
const CLIENT_STATUSES = [
  ['scheduled', 'Scheduled'], ['pending', 'Pending'], ['active', 'Active'],
  ['contact1', 'Contact 1'], ['contact2', 'Contact 2'], ['contact3', 'Contact 3'],
  ['complete', 'Complete'], ['nsf', 'NSF'], ['cancelled', 'Cancelled'], ['expired', 'Expired'], ['closed', 'Closed'],
  ['other', 'Other recorded status'], ['not_recorded', 'Not recorded'],
];
const TICKET_STATUSES = [['open', 'Open'], ['closed', 'Closed'], ['other', 'Other recorded status'], ['not_recorded', 'Not recorded']];
const PROSPECT_STATUSES = [['new', 'New'], ['contacted', 'Contacted'], ['qualified', 'Qualified'], ['closed', 'Closed'], ['other', 'Other recorded status'], ['not_recorded', 'Not recorded']];
const OWNERS = [['Ashley', 'Ashley'], ['Marcus', 'Marcus'], ['unassigned', 'Unassigned'], ['other', 'Other recorded owner']];
const centralTime = value => new Date(value).toLocaleString('en-US', { timeZone: 'America/Chicago' });
const count = value => Number.isSafeInteger(value) && value >= 0;
function confirmedReport(value) {
  if (!value || value.scope !== 'all_time' || value.consistency !== 'separate_reads' ||
      !['readStartedAt', 'generatedAt'].every(key => typeof value[key] === 'string' && Number.isFinite(Date.parse(value[key])))) return false;
  for (const [key, buckets] of [['inquiries', INQUIRY_STATUSES], ['clients', CLIENT_STATUSES], ['tickets', TICKET_STATUSES], ['prospects', PROSPECT_STATUSES]]) {
    const section = value[key];
    if (!section || !count(section.total) || !buckets.every(([name]) => count(section.statuses?.[name])) ||
        buckets.reduce((sum, [name]) => sum + section.statuses[name], 0) !== section.total) return false;
  }
  if (!OWNERS.every(([key]) => count(value.inquiries.owners?.[key])) ||
      OWNERS.reduce((sum, [key]) => sum + value.inquiries.owners[key], 0) !== value.inquiries.total) return false;
  return ['inquiries', 'clients'].every(key => count(value[key].overdue) && count(value[key].unscheduled) && value[key].overdue + value[key].unscheduled <= value[key].total);
}
function Breakdown({ title, rows, values }) {
  return <table className="w-full text-left text-sm">
    <caption className="mb-2 text-left font-semibold text-slate-700">{title}</caption>
    <thead><tr className="border-b text-xs text-slate-500"><th scope="col" className="py-2">Recorded category</th><th scope="col" className="py-2 text-right">Count</th></tr></thead>
    <tbody>{rows.map(([key, label]) => <tr key={key} className="border-b border-slate-100"><th scope="row" className="py-2 font-normal">{label}</th><td className="py-2 text-right tabular-nums">{values[key]}</td></tr>)}</tbody>
  </table>;
}

function OperationalReports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const request = useRef(0);
  const load = useCallback(async () => {
    const current = ++request.current;
    setLoading(true); setError('');
    try {
      const response = await portalFetch('/api/reports');
      let body;
      try { body = await response.json(); } catch { throw new Error('Report response could not be confirmed. Please retry.'); }
      if (!response.ok) throw new Error(body?.error || 'Reports are unavailable. Please retry.');
      if (!confirmedReport(body)) throw new Error('Report counts could not be confirmed. Please retry.');
      if (current === request.current) setReport(body);
    } catch (readError) {
      if (current === request.current) setError(readError.message || 'Reports are unavailable. Please retry.');
    } finally { if (current === request.current) setLoading(false); }
  }, []);
  useEffect(() => { void load(); return () => { request.current += 1; }; }, [load]);

  return <div className="operations-report analytics-stack">
    <div className="analytics-heading"><div><p className="analytics-eyebrow">Reports / Operations</p><h1>Operational records</h1><p>All-time totals and follow-up workload recorded in HRS.</p></div><button type="button" onClick={load} disabled={loading} className="analytics-button">Refresh operational records</button></div>
    {loading && <p role="status">{report ? 'Refreshing reports. Previous counts remain below.' : 'Loading reports…'}</p>}
    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      <p>{error}</p>{report && <p>Showing previous results, which may be out of date.</p>}
    </div>}
    {report && <>
      <h2 className="text-xl font-bold text-[#002D5B]">All-time operational records</h2>
      <p className="text-sm text-slate-600">These records include closed fictional tests. The website reporting period and staff/test filter above do not apply to this section.</p>
      <div className="rounded-xl border bg-white p-4 text-sm text-slate-600">
        <p>Last refreshed: <time dateTime={report.generatedAt}>{centralTime(report.generatedAt)}</time> Central</p>
        <p>Counts use separate database reads, not one transaction snapshot. Records can change during refresh.</p>
        <p>Overdue means a next-action date before {centralTime(report.readStartedAt)} Central. Unscheduled means no next-action date. Closed inquiries and complete, cancelled, expired or closed clients are excluded from these action counts.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminCard title="Website inquiry records">
          <p className="mb-3 text-3xl font-bold tabular-nums">{report.inquiries.total}</p>
          <p className="mb-3 text-sm">{report.inquiries.overdue} overdue · {report.inquiries.unscheduled} unscheduled</p>
          <Breakdown title="Inquiry statuses" rows={INQUIRY_STATUSES} values={report.inquiries.statuses} />
          <div className="mt-4"><Breakdown title="Recorded inquiry owners" rows={OWNERS} values={report.inquiries.owners} /></div>
          <p className="mt-3 text-xs text-slate-500">Website manual-review records, including closed test requests. Owner names match the stored Ashley/Marcus spelling exactly; other names stay grouped, and blank names are unassigned.</p>
          <Link to="/admin/requests" className="mt-3 inline-block text-sm text-blue-700 underline">Open request queue</Link>
        </AdminCard>
        <AdminCard title="Client records">
          <p className="mb-3 text-3xl font-bold tabular-nums">{report.clients.total}</p>
          <p className="mb-3 text-sm">{report.clients.overdue} overdue · {report.clients.unscheduled} unscheduled</p>
          <Breakdown title="Client statuses" rows={CLIENT_STATUSES} values={report.clients.statuses} />
          <Link to="/admin/clients" className="mt-3 inline-block text-sm text-blue-700 underline">Open client directory</Link>
        </AdminCard>
        <AdminCard title="Internal tickets">
          <p className="mb-3 text-3xl font-bold tabular-nums">{report.tickets.total}</p>
          <Breakdown title="Ticket statuses" rows={TICKET_STATUSES} values={report.tickets.statuses} />
          <Link to="/admin/help-desk/all" className="mt-3 inline-block text-sm text-blue-700 underline">Open ticket history</Link>
        </AdminCard>
        <AdminCard title="Prospects">
          <p className="mb-3 text-3xl font-bold tabular-nums">{report.prospects.total}</p>
          <Breakdown title="Prospect statuses" rows={PROSPECT_STATUSES} values={report.prospects.statuses} />
          <p className="mt-3 text-xs text-slate-500">Recorded prospect statuses do not establish a sale or service activation.</p>
          <Link to="/admin/prospects" className="mt-3 inline-block text-sm text-blue-700 underline">Open prospects</Link>
        </AdminCard>
      </div>
    </>}
  </div>;
}

export default function AdminReports() {
  const [mode, setMode] = useState('website');
  return <div className="reports-workspace">
    <div className="reports-mode" role="group" aria-label="Report category"><button type="button" aria-pressed={mode==='website'} onClick={()=>setMode('website')}>Website analytics</button><button type="button" aria-pressed={mode==='operations'} onClick={()=>setMode('operations')}>Operations</button></div>
    {mode==='website'?<AnalyticsDashboard/>:<OperationalReports/>}
  </div>;
}
