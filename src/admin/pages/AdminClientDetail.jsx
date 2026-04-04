import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import DisputeLetterModal from '../../components/DisputeLetterModal';
import CloverPaymentForm from '../../components/CloverPaymentForm';
import { AdminCard } from '../components/AdminCard';
import {
  HARD_CODED_HOT_LINKS,
  CUSTOM_HOT_LINKS_DEFAULT,
  BEGINNING_STATUSES_SAMPLE,
  TAIL_ENDS_SAMPLE,
} from '../constants/hotLinks';
import { BUREAU_LETTER_ROUNDS, CREDITOR_LETTER_TYPES } from '../constants/letterRounds';

const TABS = [
  { id: 'status', label: 'Client status' },
  { id: 'all', label: 'All items' },
  { id: 'open', label: 'Open only' },
  { id: 'letters', label: 'Letters' },
  { id: 'billing', label: 'Billing' },
];

const addOneMonth = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().split('T')[0];
};

const MOCK_CREDITORS = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  name: `Sample Creditor ${String.fromCharCode(65 + (i % 26))}${i}`,
}));

export default function AdminClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [payment, setPayment] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('status');
  const [notesSub, setNotesSub] = useState('notes');
  const [panel, setPanel] = useState('actions');
  const [trackerLayout, setTrackerLayout] = useState('vertical');
  const [showSSN, setShowSSN] = useState(false);
  const [extraFields, setExtraFields] = useState(false);
  const [modalDispute, setModalDispute] = useState(null);
  const [creditorQ, setCreditorQ] = useState('');
  const [newNote, setNewNote] = useState({ received: '', action: '' });
  const [customHot, setCustomHot] = useState(CUSTOM_HOT_LINKS_DEFAULT);
  const [newHot, setNewHot] = useState('');
  const [resultsDate, setResultsDate] = useState('');
  const [clientStatus, setClientStatus] = useState('active');
  const [showPayForm, setShowPayForm] = useState(false);
  const [paymentEdit, setPaymentEdit] = useState(false);
  const [payForm, setPayForm] = useState({
    setup_fee_amount: '',
    setup_fee_date: '',
    monthly_amount: '',
    monthly_start_date: '',
  });
  const [savingPay, setSavingPay] = useState(false);

  const load = async () => {
    setLoading(true);
    const [cr, pr, hr, dr, docr] = await Promise.all([
      supabase.from('clients').select('*').eq('id', id).single(),
      supabase.from('payments').select('*').eq('client_id', id).maybeSingle(),
      supabase.from('payment_history').select('*').eq('client_id', id).order('charged_at', { ascending: false }),
      supabase.from('dispute_letters').select('*').eq('client_id', id).order('created_at', { ascending: false }),
      supabase.from('documents').select('*').eq('client_id', id).order('created_at', { ascending: false }),
    ]);
    setClient(cr.data);
    setPayment(pr.data);
    setPaymentHistory(hr.data || []);
    setDisputes(dr.data || []);
    setDocuments(docr.data || []);
    if (pr.data) {
      setPayForm({
        setup_fee_amount: pr.data.setup_fee_amount ?? '',
        setup_fee_date: pr.data.setup_fee_date ?? '',
        monthly_amount: pr.data.monthly_amount ?? '',
        monthly_start_date: pr.data.monthly_start_date ?? '',
      });
    } else if (cr.data?.created_at) {
      const sd = new Date(cr.data.created_at).toISOString().split('T')[0];
      setPayForm({
        setup_fee_amount: '',
        setup_fee_date: sd,
        monthly_amount: '',
        monthly_start_date: addOneMonth(sd),
      });
    }
    if (cr.data?.status) setClientStatus(cr.data.status);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload on client id
  }, [id]);

  const [dfrDays, setDfrDays] = useState('—');
  useEffect(() => {
    if (!resultsDate) {
      setDfrDays('—');
      return;
    }
    const target = new Date(resultsDate + 'T12:00:00').getTime();
    const now = Date.now();
    setDfrDays(String(Math.max(0, Math.ceil((target - now) / (1000 * 60 * 60 * 24)))));
  }, [resultsDate]);

  const openDisputes = useMemo(
    () => disputes.filter((d) => d.status !== 'completed'),
    [disputes]
  );

  const filteredCreditors = useMemo(() => {
    const q = creditorQ.toLowerCase().trim();
    if (!q) return MOCK_CREDITORS.slice(0, 12);
    return MOCK_CREDITORS.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 50);
  }, [creditorQ]);

  const savePaymentConfig = async () => {
    setSavingPay(true);
    const payload = {
      client_id: id,
      setup_fee_amount: parseInt(payForm.setup_fee_amount, 10) || 0,
      setup_fee_date: payForm.setup_fee_date || null,
      monthly_amount: parseInt(payForm.monthly_amount, 10) || 0,
      monthly_start_date: payForm.monthly_start_date || null,
    };
    if (payment) await supabase.from('payments').update(payload).eq('id', payment.id);
    else await supabase.from('payments').insert(payload);
    setSavingPay(false);
    setPaymentEdit(false);
    load();
  };

  const formatCents = (cents) => (cents ? `$${(cents / 100).toFixed(2)}` : '$0.00');

  const saveLetterText = async (letterText) => {
    if (!modalDispute) return;
    await supabase.from('dispute_letters').update({ letter_text: letterText }).eq('id', modalDispute.id);
    setModalDispute(null);
    load();
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-500">
        Loading client…
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center">
        <p className="text-slate-600">Client not found.</p>
        <button
          type="button"
          onClick={() => navigate('/admin/clients')}
          className="mt-4 font-semibold text-[#2562FF] hover:underline"
        >
          Back to clients
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate('/admin/clients')}
            className="mb-2 text-sm font-semibold text-[#2562FF] hover:underline"
          >
            ← All clients
          </button>
          <h1 className="font-display text-2xl font-black text-[#002D5B]">
            {client.first_name} {client.last_name}
          </h1>
          <p className="text-sm text-slate-500">
            Client ID: <span className="font-mono text-xs">{client.id}</span> · Logins: 0 · Last login: —
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">
            {clientStatus}
          </span>
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700"
          >
            Dashboard
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-t-lg px-4 py-2 text-sm font-semibold ${
              tab === t.id
                ? 'bg-[#002D5B] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'status' && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-4">
              <AdminCard title="Personal info">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Name">
                    {client.first_name} {client.last_name}
                  </Field>
                  <Field label="Country">
                    <select className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm">
                      <option>United States</option>
                      <option>Canada</option>
                    </select>
                  </Field>
                  <Field label="Address" className="sm:col-span-2">
                    <input className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm" defaultValue={client.address || ''} />
                  </Field>
                  <Field label="City">
                    <input className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm" defaultValue={client.city || ''} />
                  </Field>
                  <Field label="State">
                    <input className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm" defaultValue={client.state || ''} />
                  </Field>
                  <Field label="Zip">
                    <input className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm" defaultValue={client.zip || ''} />
                  </Field>
                  <Field label="Email">
                    <input className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm" defaultValue={client.email || ''} />
                  </Field>
                  <Field label="Daytime phone">
                    <input className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm" defaultValue={client.phone || ''} />
                  </Field>
                  <Field label="Carrier (SMS)">
                    <select className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm">
                      <option>Do Not SMS</option>
                      <option>Verizon</option>
                      <option>AT&T</option>
                    </select>
                  </Field>
                  <Field label="SSN">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{showSSN ? '***-**-1234' : '••••••••'}</span>
                      <button
                        type="button"
                        className="text-xs font-semibold text-[#2562FF]"
                        onClick={() => setShowSSN(!showSSN)}
                      >
                        Reveal
                      </button>
                    </div>
                  </Field>
                  <Field label="DOB">
                    <input className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm" type="date" />
                  </Field>
                  <Field label="Font (letters)">
                    <select className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm">
                      <option>Times New Roman</option>
                      <option>Arial</option>
                    </select>
                  </Field>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold"
                    onClick={() => alert('Resend welcome email (wire to email API)')}
                  >
                    Resend welcome email
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
                    onClick={() => setExtraFields(!extraFields)}
                  >
                    {extraFields ? 'Hide' : 'Show'} extra fields
                  </button>
                </div>
                {extraFields && (
                  <div className="mt-3 grid gap-2 rounded-xl bg-slate-50 p-3 text-sm">
                    <Field label="Username">
                      <input className="w-full rounded border border-slate-200 px-2 py-1" />
                    </Field>
                    <Field label="Password">
                      <input className="w-full rounded border border-slate-200 px-2 py-1" type="password" />
                    </Field>
                  </div>
                )}
                <textarea
                  className="mt-4 w-full rounded-xl border border-slate-200 p-3 text-sm"
                  rows={4}
                  placeholder="Details / notes (affiliate, broker, assigned, sales, special instructions)"
                  defaultValue={client.notes || ''}
                />
                <button
                  type="button"
                  className="mt-3 rounded-xl bg-[#2562FF] px-4 py-2 text-sm font-semibold text-white"
                  onClick={() => alert('Save profile (wire fields to Supabase columns)')}
                >
                  Update
                </button>
              </AdminCard>
            </div>

            <div className="space-y-4 lg:col-span-5">
              <AdminCard
                title="Notes & communication"
                actions={
                  <div className="flex gap-1">
                    {['notes', 'sms', 'internal'].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setNotesSub(n)}
                        className={`rounded-lg px-2 py-1 text-xs font-semibold capitalize ${
                          notesSub === n ? 'bg-[#002D5B] text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                }
              >
                {notesSub === 'notes' && (
                  <div className="max-h-48 space-y-2 overflow-auto text-sm text-slate-600">
                    <p className="rounded-lg bg-slate-50 p-2 text-xs">
                      <span className="font-semibold text-slate-800">2026-04-01 · Counselor</span>
                      <br />
                      Called client — left voicemail.
                    </p>
                  </div>
                )}
                {notesSub === 'sms' && <p className="text-sm text-slate-500">SMS thread (carrier-aware).</p>}
                {notesSub === 'internal' && <p className="text-sm text-slate-500">Internal notes (admin only).</p>}
                <div className="mt-4 grid gap-2 border-t border-slate-100 pt-4">
                  <p className="text-xs font-bold uppercase text-slate-500">Add new note</p>
                  <textarea
                    className="rounded-lg border border-slate-200 p-2 text-sm"
                    placeholder="Received"
                    value={newNote.received}
                    onChange={(e) => setNewNote({ ...newNote, received: e.target.value })}
                  />
                  <textarea
                    className="rounded-lg border border-slate-200 p-2 text-sm"
                    placeholder="Action taken"
                    value={newNote.action}
                    onChange={(e) => setNewNote({ ...newNote, action: e.target.value })}
                  />
                  <button
                    type="button"
                    className="w-fit rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white"
                    onClick={() => alert('Persist to notes table')}
                  >
                    Add note
                  </button>
                </div>

                <div className="mt-6">
                  <p className="text-xs font-bold uppercase text-slate-500">Hard-coded hot links</p>
                  <div className="mt-2 flex max-h-40 flex-wrap gap-1 overflow-auto">
                    {HARD_CODED_HOT_LINKS.map((h) => (
                      <button
                        key={h}
                        type="button"
                        className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 hover:bg-slate-200"
                        onClick={() => alert(`Insert template: ${h}`)}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-xs font-bold uppercase text-slate-500">Custom hot links</p>
                  <div className="mt-2 flex max-h-48 flex-wrap gap-1 overflow-auto">
                    {customHot.map((h) => (
                      <button
                        key={h}
                        type="button"
                        className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-900 hover:bg-emerald-100"
                        onClick={() => alert(`Template: ${h}`)}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <input
                      className="flex-1 rounded-lg border border-slate-200 px-2 py-1 text-sm"
                      placeholder="New custom hot link"
                      value={newHot}
                      onChange={(e) => setNewHot(e.target.value)}
                    />
                    <button
                      type="button"
                      className="rounded-lg bg-[#2562FF] px-3 py-1 text-sm font-semibold text-white"
                      onClick={() => {
                        if (!newHot.trim()) return;
                        setCustomHot((prev) => [...prev, newHot.trim()]);
                        setNewHot('');
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </AdminCard>
            </div>

            <div className="space-y-4 lg:col-span-3">
              <AdminCard
                title="Actions & documents"
                actions={
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className={`rounded-lg px-2 py-1 text-xs font-semibold ${panel === 'actions' ? 'bg-[#002D5B] text-white' : 'bg-slate-100'}`}
                      onClick={() => setPanel('actions')}
                    >
                      Actions
                    </button>
                    <button
                      type="button"
                      className={`rounded-lg px-2 py-1 text-xs font-semibold ${panel === 'results' ? 'bg-[#002D5B] text-white' : 'bg-slate-100'}`}
                      onClick={() => setPanel('results')}
                    >
                      Results
                    </button>
                  </div>
                }
              >
                {panel === 'actions' && (
                  <>
                    <label className="text-xs font-bold uppercase text-slate-500">Status</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <select
                        className="flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                        value={clientStatus}
                        onChange={(e) => setClientStatus(e.target.value)}
                      >
                        {['scheduled', 'pending', 'active', 'complete', 'cancelled'].map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="rounded-lg bg-[#2562FF] px-3 py-1.5 text-sm font-semibold text-white"
                        onClick={() => alert('Update status in DB')}
                      >
                        Update
                      </button>
                    </div>
                    <label className="mt-4 block text-xs font-bold uppercase text-slate-500">
                      Date for results
                    </label>
                    <input
                      type="date"
                      className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                      value={resultsDate}
                      onChange={(e) => setResultsDate(e.target.value)}
                    />
                    <p className="mt-2 text-sm text-slate-600">
                      DFR (days for results): <strong>{dfrDays}</strong>
                    </p>
                    <button
                      type="button"
                      className="mt-3 w-full rounded-xl border border-slate-200 py-2 text-sm font-semibold"
                      onClick={() => navigate('/admin/appointments')}
                    >
                      Set follow-up
                    </button>
                    <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500">
                      Secure docs: drag & drop or{' '}
                      <button type="button" className="font-semibold text-[#2562FF]" onClick={() => alert('Open file picker')}>
                        select files
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">Proofs: AV + SSN proof uploads (use existing documents API).</p>
                  </>
                )}
                {panel === 'results' && (
                  <p className="text-sm text-slate-600">
                    Results summary and bureau pull placeholders. Connect credit monitoring integration here.
                  </p>
                )}
              </AdminCard>
            </div>
          </div>

          <AdminCard title="Assignments & status line">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {['Affiliate', 'Broker', 'Sales', 'Counselor'].map((role) => (
                <div key={role}>
                  <label className="text-xs font-bold uppercase text-slate-500">{role}</label>
                  <div className="mt-1 flex gap-1">
                    <select className="flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-sm">
                      <option>— Unassigned —</option>
                      <option>Team member A</option>
                    </select>
                    <button type="button" className="rounded-lg bg-slate-100 px-2 text-xs">
                      Set
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-500">Status line (client menu)</label>
                <select className="mt-1 block rounded-lg border border-slate-200 px-2 py-1.5 text-sm">
                  <option>Standard</option>
                  <option>VIP</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-slate-500">Interviewer link</label>
                <input className="mt-1 w-full max-w-xs rounded-lg border border-slate-200 px-2 py-1.5 text-sm" placeholder="https://…" />
              </div>
            </div>
          </AdminCard>
        </div>
      )}

      {tab === 'all' && (
        <div className="space-y-4">
          <AdminCard
            title="Result tracker"
            actions={
              <div className="flex gap-1">
                {['vertical', 'horizontal', 'classic'].map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setTrackerLayout(l)}
                    className={`rounded-lg px-2 py-1 text-xs font-semibold capitalize ${
                      trackerLayout === l ? 'bg-[#002D5B] text-white' : 'bg-slate-100'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            }
          >
            <div className={`grid gap-4 ${trackerLayout === 'horizontal' ? 'md:grid-cols-3' : 'grid-cols-1'}`}>
              {['Equifax', 'Experian', 'TransUnion'].map((bureau) => (
                <div key={bureau} className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                  <h3 className="font-display font-bold text-[#002D5B]">{bureau}</h3>
                  <ul className="mt-2 space-y-2 text-sm">
                    {disputes
                      .filter((d) => (d.bureau || '').toLowerCase() === bureau.toLowerCase())
                      .map((d) => (
                        <li key={d.id} className="rounded-lg bg-white p-2 shadow-sm">
                          <div className="font-medium">{d.account_name || 'Account'}</div>
                          <div className="text-xs text-slate-500">{d.status || 'open'}</div>
                        </li>
                      ))}
                    {disputes.filter((d) => (d.bureau || '').toLowerCase() === bureau.toLowerCase()).length ===
                      0 && <li className="text-slate-500">No items yet.</li>}
                  </ul>
                </div>
              ))}
            </div>
          </AdminCard>

          <AdminCard title="Add new account (dispute item)">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <label className="text-sm">
                Account type
                <select className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5">
                  <option>Equifax</option>
                  <option>Experian</option>
                  <option>TransUnion</option>
                </select>
              </label>
              <label className="text-sm sm:col-span-2">
                Creditor
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5"
                  placeholder="Search 4,420+ creditors"
                  value={creditorQ}
                  onChange={(e) => setCreditorQ(e.target.value)}
                />
                <div className="mt-1 max-h-24 overflow-auto rounded border border-slate-100 bg-white text-xs">
                  {filteredCreditors.map((c) => (
                    <div key={c.id} className="cursor-pointer px-2 py-1 hover:bg-slate-50">
                      {c.name}
                    </div>
                  ))}
                </div>
              </label>
              <label className="text-sm">
                Account #
                <input className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5" />
              </label>
              <label className="text-sm">
                Beginning status
                <select className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5">
                  {BEGINNING_STATUSES_SAMPLE.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                Tail end dispute
                <select className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5">
                  {TAIL_ENDS_SAMPLE.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className="rounded-lg bg-[#2562FF] px-4 py-2 text-sm font-semibold text-white"
                onClick={() => alert('Insert into dispute_items table')}
              >
                Add
              </button>
              <button type="button" className="rounded-lg border border-slate-200 px-4 py-2 text-sm">
                Clear
              </button>
            </div>
          </AdminCard>
        </div>
      )}

      {tab === 'open' && (
        <AdminCard title="Open items only">
          <ul className="divide-y divide-slate-100">
            {openDisputes.length === 0 ? (
              <li className="py-6 text-center text-slate-500">No open dispute letters.</li>
            ) : (
              openDisputes.map((d) => (
                <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div>
                    <div className="font-medium text-[#002D5B]">{d.account_name || 'Account'}</div>
                    <div className="text-xs text-slate-500">
                      {d.bureau} · {d.status || 'open'}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-sm font-semibold text-[#2562FF]"
                    onClick={() => setModalDispute(d)}
                  >
                    Open letter
                  </button>
                </li>
              ))
            )}
          </ul>
        </AdminCard>
      )}

      {tab === 'letters' && (
        <div className="space-y-6">
          <AdminCard title="Bureau letters (multi-round)">
            <div className="max-h-96 space-y-3 overflow-auto">
              {BUREAU_LETTER_ROUNDS.map((round) => (
                <div key={round} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-[#002D5B]">{round}</span>
                    <div className="flex gap-2 text-xs">
                      <button type="button" className="text-[#2562FF] hover:underline">
                        Add to list
                      </button>
                      <button type="button" className="text-slate-500 hover:underline">
                        Edit
                      </button>
                      <button type="button" className="text-red-600 hover:underline">
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-sm">
                    {['Equifax', 'Experian', 'TransUnion', '3-Bureau'].map((b) => (
                      <button
                        key={b}
                        type="button"
                        className="rounded-lg bg-slate-100 px-2 py-1 font-medium hover:bg-slate-200"
                        onClick={() => alert(`Template editor: ${round} · ${b}`)}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>
          <AdminCard title="Creditor letters">
            <ul className="divide-y divide-slate-100">
              {CREDITOR_LETTER_TYPES.map((t) => (
                <li key={t} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <span>{t}</span>
                  <span className="flex gap-2 text-xs">
                    <button type="button" className="font-semibold text-[#2562FF] hover:underline">
                      Edit
                    </button>
                    <button type="button" className="text-red-600 hover:underline">
                      Delete
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </AdminCard>
        </div>
      )}

      {tab === 'billing' && (
        <div className="space-y-6">
          {showPayForm && (
            <CloverPaymentForm
              client={client}
              onPaymentSuccess={() => {
                setShowPayForm(false);
                load();
              }}
              onClose={() => setShowPayForm(false)}
            />
          )}
          <AdminCard
            title="Subscriptions & payments"
            actions={
              <div className="flex gap-2">
                {(!payment || !payment.clover_customer_id) && (
                  <button
                    type="button"
                    onClick={() => setShowPayForm(true)}
                    className="rounded-lg bg-[#2562FF] px-3 py-1.5 text-sm font-semibold text-white"
                  >
                    Set up payment
                  </button>
                )}
                {payment && !paymentEdit && (
                  <button
                    type="button"
                    onClick={() => setPaymentEdit(true)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
                  >
                    Edit
                  </button>
                )}
              </div>
            }
          >
            {paymentEdit ? (
              <div className="grid gap-3 md:grid-cols-2">
                <label className="text-sm">
                  Setup fee (cents)
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5"
                    type="number"
                    value={payForm.setup_fee_amount}
                    onChange={(e) => setPayForm({ ...payForm, setup_fee_amount: e.target.value })}
                  />
                </label>
                <label className="text-sm">
                  Setup fee date
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5"
                    type="date"
                    value={payForm.setup_fee_date || ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      setPayForm({
                        ...payForm,
                        setup_fee_date: v,
                        monthly_start_date: addOneMonth(v),
                      });
                    }}
                  />
                </label>
                <label className="text-sm">
                  Monthly (cents)
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5"
                    type="number"
                    value={payForm.monthly_amount}
                    onChange={(e) => setPayForm({ ...payForm, monthly_amount: e.target.value })}
                  />
                </label>
                <label className="text-sm">
                  Monthly start
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5"
                    type="date"
                    value={payForm.monthly_start_date || ''}
                    readOnly
                  />
                </label>
                <div className="md:col-span-2 flex justify-end gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
                    onClick={() => setPaymentEdit(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="rounded-lg bg-[#002D5B] px-4 py-2 text-sm font-semibold text-white"
                    onClick={savePaymentConfig}
                    disabled={savingPay}
                  >
                    {savingPay ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>
            ) : payment ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="text-xs font-bold uppercase text-slate-500">Setup fee</div>
                  <div className="font-display text-xl font-bold">{formatCents(payment.setup_fee_amount)}</div>
                  <div className="text-xs text-slate-500">
                    Status: {payment.setup_fee_status || '—'}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="text-xs font-bold uppercase text-slate-500">Monthly</div>
                  <div className="font-display text-xl font-bold">
                    {formatCents(payment.monthly_amount)}/mo
                  </div>
                  <div className="text-xs text-slate-500">Start: {payment.monthly_start_date || '—'}</div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-600">No payment record — add configuration.</p>
            )}
          </AdminCard>

          <AdminCard title="Transactions">
            {paymentHistory.length === 0 ? (
              <p className="text-sm text-slate-500">No transactions yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {paymentHistory.map((h) => (
                  <li key={h.id} className="flex justify-between py-2 text-sm">
                    <span>{h.description || h.type}</span>
                    <span className="font-semibold">{formatCents(h.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </AdminCard>

          <AdminCard title="Demand draft">
            <div className="grid gap-3 md:grid-cols-2">
              {[
                ['Setup fee', 'Paid'],
                ['Monthly fee', 'Due date'],
                ['Payment method', 'CC / Check'],
                ['Bank / card #', '••••4242'],
                ['Routing #', '—'],
                ['Account #', '—'],
                ['ABA', '—'],
                ['Account holder', `${client.first_name} ${client.last_name}`],
              ].map(([a, b]) => (
                <div key={a} className="flex justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                  <span className="text-slate-500">{a}</span>
                  <span className="font-medium">{b}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
                onClick={() => alert('Draft check workflow')}
              >
                Draft check
              </button>
              <button
                type="button"
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
                onClick={() => alert('Sample check PDF')}
              >
                Sample check
              </button>
            </div>
          </AdminCard>
        </div>
      )}

      {modalDispute && (
        <DisputeLetterModal
          dispute={modalDispute}
          client={client}
          onSave={saveLetterText}
          onClose={() => setModalDispute(null)}
        />
      )}
    </div>
  );
}

function Field({ label, children, className = '' }) {
  return (
    <div className={className}>
      <div className="text-[11px] font-bold uppercase text-slate-500">{label}</div>
      <div className="mt-1">{children}</div>
    </div>
  );
}
