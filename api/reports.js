import { requireAdmin, sameOrigin } from './_lib/portal-session.js';
import { serverDb } from './_lib/server-db.js';

const STATUSES = {
  inquiries: ['pending_manual_review','contact_scheduled','agreement_hold','secure_intake_pending','closed'],
  clients: ['scheduled','pending','active','contact1','contact2','contact3','complete','nsf','cancelled','expired','closed'],
  tickets: ['open','closed'],
  prospects: ['new','contacted','qualified','closed'],
};
const TABLES = {inquiries:'enrollments',clients:'clients',tickets:'help_tickets',prospects:'prospects'};
const TERMINAL = {inquiries:['closed'],clients:['complete','cancelled','expired','closed']};
const invalid = () => new Error('Operational count is unavailable or inconsistent');
const validCount = value => Number.isSafeInteger(value) && value >= 0;

// Four workers bound database pressure. Every query is an exact HEAD count;
// no result rows or user-selected tables/filters are requested.
async function readCounts(db, jobs) {
  const results = new Map();
  let cursor = 0, failed = false;
  async function worker() {
    while (!failed && cursor < jobs.length) {
      const job = jobs[cursor++];
      try {
        let q = db.from(TABLES[job.section]).select('id',{count:'exact',head:true});
        if (job.section === 'inquiries') q = q.eq('enrollment_source','website_manual');
        for (const [method,column,value] of job.filters) q = q[method](column,value);
        const {count,error} = await q;
        if (error || !validCount(count)) throw invalid();
        results.set(job.key,count);
      } catch { failed = true; }
    }
  }
  await Promise.all(Array.from({length:Math.min(4,jobs.length)},worker));
  if (failed || results.size !== jobs.length) throw invalid();
  return results;
}

function buildJobs(readStartedAt) {
  const jobs = [];
  const add = (section,name,filters=[]) => jobs.push({section,key:`${section}.${name}`,filters});
  for (const [section,statuses] of Object.entries(STATUSES)) {
    add(section,'total');
    for (const status of statuses) add(section,`status.${status}`,[['eq','status',status]]);
    add(section,'status.null',[['is','status',null]]);
    add(section,'status.empty',[['eq','status','']]);
  }
  for (const owner of ['Ashley','Marcus']) add('inquiries',`owner.${owner}`,[['eq','assigned_to',owner]]);
  add('inquiries','owner.null',[['is','assigned_to',null]]);
  add('inquiries','owner.empty',[['eq','assigned_to','']]);
  // Subtract exact terminal counts rather than SQL neq/not.in, whose NULL
  // behavior would silently exclude rows with an unrecorded status.
  for (const [section,statuses] of Object.entries(TERMINAL)) {
    for (const [name,dateFilter] of [['overdue',['lt','next_action_at',readStartedAt]],['unscheduled',['is','next_action_at',null]]]) {
      add(section,name,[dateFilter]);
      for (const status of statuses) add(section,`${name}.${status}`,[dateFilter,['eq','status',status]]);
    }
  }
  return jobs;
}

function reportFrom(counts) {
  const report = {};
  const get = (section,key) => counts.get(`${section}.${key}`);
  for (const [section,names] of Object.entries(STATUSES)) {
    const total = get(section,'total');
    const statuses = Object.fromEntries(names.map(name => [name,get(section,`status.${name}`)]));
    const missing = get(section,'status.null') + get(section,'status.empty');
    const recorded = Object.values(statuses).reduce((sum,count) => sum+count,0);
    const other = total-recorded-missing;
    if (!validCount(other) || !validCount(missing)) throw invalid();
    report[section] = {total,statuses:{...statuses,other,not_recorded:missing}};
  }
  const inquiryTotal = report.inquiries.total;
  const Ashley = get('inquiries','owner.Ashley'), Marcus = get('inquiries','owner.Marcus');
  const unassigned = get('inquiries','owner.null') + get('inquiries','owner.empty');
  const other = inquiryTotal-Ashley-Marcus-unassigned;
  if (!validCount(other) || !validCount(unassigned)) throw invalid();
  report.inquiries.owners = {Ashley,Marcus,unassigned,other};
  for (const [section,names] of Object.entries(TERMINAL)) {
    const total = report[section].total;
    const terminalTotal = names.reduce((sum,name) => sum+report[section].statuses[name],0);
    if (get(section,'overdue')+get(section,'unscheduled') > total || names.some(name => get(section,`overdue.${name}`)+get(section,`unscheduled.${name}`) > report[section].statuses[name])) throw invalid();
    for (const kind of ['overdue','unscheduled']) {
      const all = get(section,kind);
      const terminals = names.map(name => get(section,`${kind}.${name}`));
      if (all > total || terminals.some((n,i) => n > report[section].statuses[names[i]])) throw invalid();
      const workload = all-terminals.reduce((sum,n) => sum+n,0);
      if (!validCount(workload) || workload > total-terminalTotal) throw invalid();
      report[section][kind] = workload;
    }
    if (report[section].overdue+report[section].unscheduled > total-terminalTotal) throw invalid();
  }
  return report;
}

export default async function handler(req,res) {
  res.setHeader('Cache-Control','no-store');
  if (req.method !== 'GET') return res.status(405).json({error:'Method not allowed'});
  const member = await requireAdmin(req,res);
  if (!member) return;
  if (!sameOrigin(req)) return res.status(403).json({error:'Use the team portal for reports.'});
  if (req.query && (typeof req.query !== 'object' || Array.isArray(req.query) || Object.keys(req.query).length)) return res.status(400).json({error:'Reports use a fixed all-time operational scope.'});
  const readStartedAt = new Date().toISOString();
  try {
    const counts = await readCounts(serverDb(),buildJobs(readStartedAt));
    const report = reportFrom(counts);
    return res.status(200).json({readStartedAt,generatedAt:new Date().toISOString(),scope:'all_time',consistency:'separate_reads',...report});
  } catch {
    return res.status(503).json({error:'Operational reports could not be refreshed. Please retry.'});
  }
}
