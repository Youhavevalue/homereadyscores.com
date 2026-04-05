import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useAdminToast } from '../context/AdminToastContext';
import DisputeLetterModal from '../../components/DisputeLetterModal';
import CloverPaymentForm from '../../components/CloverPaymentForm';
import { AdminCard } from '../components/AdminCard';
import AdminDocumentList from '../components/AdminDocumentList';
import {
  HARD_CODED_HOT_LINKS,
  CUSTOM_HOT_LINKS_DEFAULT,
  BEGINNING_STATUSES_SAMPLE,
  TAIL_ENDS_SAMPLE,
} from '../constants/hotLinks';
import { BUREAU_LETTER_ROUNDS, CREDITOR_LETTER_TYPES } from '../constants/letterRounds';
import {
  fetchClientNotes,
  insertClientNote,
  fetchStaffHotLinks,
  insertStaffHotLink,
  deleteStaffHotLink,
  ensureDefaultStaffHotLinks,
} from '../lib/adminData';

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

const CLOSED_DISPUTE = new Set(['resolved', 'deleted']);

export default function AdminClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useAdminToast();

  const [client, setClient] = useState(null);
  const [intake, setIntake] = useState(null);
  const [payment, setPayment] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [clientNotes, setClientNotes] = useState([]);
  const [staffHotRows, setStaffHotRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('status');
  const [notesSub, setNotesSub] = useState('notes');
  const [panel, setPanel] = useState('actions');
  const [trackerLayout, setTrackerLayout] = useState('vertical');
  const [showSSN, setShowSSN] = useState(false);
  const [extraFields, setExtraFields] = useState(false);
  const [modalDispute, setModalDispute] = useState(null);
  const [creditorQ, setCreditorQ] = useState('');
  const [selectedCreditorName, setSelectedCreditorName] = useState('');
  const [newNote, setNewNote] = useState({ received: '', action: '' });
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
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    notes: '',
  });
  const [dob, setDob] = useState('');
  const [disputeForm, setDisputeForm] = useState({
    bureau: 'Experian',
    accountName: '',
    accountLast4: '',
    beginningStatus: BEGINNING_STATUSES_SAMPLE[0],
    tailEnd: TAIL_ENDS_SAMPLE[0],
  });
  const [dfrDays, setDfrDays] = useState('—');

  const load = async () => {
    setLoading(true);
    const [cr, pr, hr, dr, docr, intakeRes] = await Promise.all([
      supabase.from('clients').select('*').eq('id', id).single(),
      supabase.from('payments').select('*').eq('client_id', id).maybeSingle(),
      supabase.from('payment_history').select('*').eq('client_id', id).order('charged_at', { ascending: false }),
      supabase.from('dispute_letters').select('*').eq('client_id', id).order('created_at', { ascending: false }),
      supabase.from('documents').select('*').eq('client_id', id).order('created_at', { ascending: false }),
      supabase.from('intake_forms').select('*').eq('client_id', id).maybeSingle(),
    ]);

    const c = cr.data;
    setClient(c);
    setPayment(pr.data);
    setPaymentHistory(hr.data || []);
    setDisputes(dr.data || []);
    setDocuments(docr.data || []);
    setIntake(intakeRes.data);

    if (c) {
      setProfile({
        first_name: c.first_name || '',
        last_name: c.last_name || '',
        email: c.email || '',
        phone: c.phone || '',
        address: c.address || '',
        city: c.city || '',
        state: c.state || '',
        zip: c.zip || '',
        notes: c.notes || '',
      });
      setClientStatus(c.status || 'active');
      setResultsDate(c.results_expected_date || '');
      setDob(intakeRes.data?.dob || '');
    }

    await ensureDefaultStaffHotLinks(CUSTOM_HOT_LINKS_DEFAULT);
    const links = await fetchStaffHotLinks();
    setStaffHotRows(links);

    if (pr.data) {
      setPayForm({
        setup_fee_amount: pr.data.setup_fee_amount ?? '',
        setup_fee_date: pr.data.setup_fee_date ?? '',
        monthly_amount: pr.data.monthly_amount ?? '',
        monthly_start_date: pr.data.monthly_start_date ?? '',
      });
    } else if (c?.created_at) {
      const sd = new Date(c.created_at).toISOString().split('T')[0];
      setPayForm({
        setup_fee_amount: '',
        setup_fee_date: sd,
        monthly_amount: '',
        monthly_start_date: addOneMonth(sd),
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    void (async () => {
      const n = await fetchClientNotes(id, notesSub);
      setClientNotes(n);
    })();
  }, [id, notesSub]);

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
    () => disputes.filter((d) => !CLOSED_DISPUTE.has((d.status || '').toLowerCase())),
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
    try {
      if (payment) await supabase.from('payments').update(payload).eq('id', payment.id);
      else await supabase.from('payments').insert(payload);
      showToast('Payment settings saved.', 'success');
      setPaymentEdit(false);
      load();
    } catch (e) {
      showToast(e.message || 'Save failed', 'error');
    }
    setSavingPay(false);
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: profile.email || null,
          phone: profile.phone || null,
          address: profile.address || null,
          city: profile.city || null,
          state: profile.state || null,
          zip: profile.zip || null,
          notes: profile.notes || null,
          results_expected_date: resultsDate || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;

      if (dob) {
        if (intake?.id) {
          await supabase.from('intake_forms').update({ dob }).eq('id', intake.id);
        } else {
          await supabase.from('intake_forms').insert({ client_id: id, dob });
        }
      }
      showToast('Client profile updated.', 'success');
      load();
    } catch (e) {
      showToast(e.message || 'Update failed', 'error');
    }
    setSavingProfile(false);
  };

  const saveStatusOnly = async () => {
    try {
      await supabase.from('clients').update({ status: clientStatus }).eq('id', id);
      showToast('Status updated.', 'success');
      load();
    } catch (e) {
      showToast(e.message || 'Failed', 'error');
    }
  };

  const addNote = async () => {
    if (!newNote.received.trim() && !newNote.action.trim()) {
      showToast('Add received text or action taken.', 'error');
      return;
    }
    setSavingNote(true);
    try {
      await insertClientNote({
        clientId: id,
        noteType: notesSub,
        receivedText: newNote.received,
        actionText: newNote.action,
        counselorName: user?.name || user?.email || 'Staff',
      });
      setNewNote({ received: '', action: '' });
      const n = await fetchClientNotes(id, notesSub);
      setClientNotes(n);
      showToast('Note saved.', 'success');
    } catch (e) {
      showToast(e.message || 'Run sql/admin_operational_migration.sql for client_notes.', 'error');
    }
    setSavingNote(false);
  };

  const addHotFromDb = async () => {
    if (!newHot.trim()) return;
    try {
      await insertStaffHotLink(newHot.trim());
      setNewHot('');
      setStaffHotRows(await fetchStaffHotLinks());
      showToast('Hot link added.', 'success');
    } catch (e) {
      showToast(e.message || 'Failed', 'error');
    }
  };

  const removeHotDb = async (hid) => {
    try {
      await deleteStaffHotLink(hid);
      setStaffHotRows(await fetchStaffHotLinks());
      showToast('Removed.', 'success');
    } catch (e) {
      showToast(e.message || 'Failed', 'error');
    }
  };

  const insertTemplate = (text) => {
    setNewNote((prev) => ({
      ...prev,
      received: prev.received ? `${prev.received}\n${text}` : text,
    }));
  };

  const addDisputeItem = async () => {
    const name = selectedCreditorName || disputeForm.accountName;
    if (!name?.trim()) {
      showToast('Select or enter a creditor / account name.', 'error');
      return;
    }
    try {
      const { error } = await supabase.from('dispute_letters').insert({
        client_id: id,
        bureau: disputeForm.bureau,
        account_name: name.trim(),
        account_number_last4: (disputeForm.accountLast4 || '').slice(-4) || null,
        dispute_reason: disputeForm.beginningStatus,
        status: 'draft',
        notes: disputeForm.tailEnd,
        round_number: 1,
      });
      if (error) throw error;
      showToast('Dispute item added.', 'success');
      setDisputeForm({
        ...disputeForm,
        accountName: '',
        accountLast4: '',
      });
      setSelectedCreditorName('');
      load();
    } catch (e) {
      showToast(e.message || 'Insert failed', 'error');
    }
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
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-slate-500">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#2562FF] border-t-transparent" />
        <p className="text-sm">Loading client…</p>
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

  const notesForTab = clientNotes.filter((n) => n.note_type === notesSub);

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
            Client ID: <span className="font-mono text-xs">{client.id}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">
            {clientStatus}
          </span>
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm"
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
            className={`rounded-t-lg px-4 py-2 text-sm font-semibold transition ${
              tab === t.id
                ? 'bg-[#002D5B] text-white shadow-sm'
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
                  <Field label="First name">
                    <input
                      className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                      value={profile.first_name}
                      onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                    />
                  </Field>
                  <Field label="Last name">
                    <input
                      className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                      value={profile.last_name}
                      onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                    />
                  </Field>
                  <Field label="Address" className="sm:col-span-2">
                    <input
                      className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                      value={profile.address}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    />
                  </Field>
                  <Field label="City">
                    <input
                      className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                      value={profile.city}
                      onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    />
                  </Field>
                  <Field label="State">
                    <input
                      className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                      value={profile.state}
                      onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                    />
                  </Field>
                  <Field label="Zip">
                    <input
                      className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                      value={profile.zip}
                      onChange={(e) => setProfile({ ...profile, zip: e.target.value })}
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    />
                  </Field>
                  <Field label="Phone">
                    <input
                      className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    />
                  </Field>
                  <Field label="SSN (intake)">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">
                        {showSSN && intake?.ssn_last4 ? `***-**-${intake.ssn_last4}` : '••••••••'}
                      </span>
                      <button
                        type="button"
                        className="text-xs font-semibold text-[#2562FF]"
                        onClick={() => setShowSSN(!showSSN)}
                      >
                        {intake?.ssn_last4 ? 'Toggle' : '—'}
                      </button>
                    </div>
                  </Field>
                  <Field label="DOB">
                    <input
                      className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                      type="date"
                      value={dob || ''}
                      onChange={(e) => setDob(e.target.value)}
                    />
                  </Field>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700"
                    onClick={() => showToast('Connect email provider for welcome emails.', 'info')}
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
                  <div className="mt-3 grid gap-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                    Portal credentials can be stored when you add dedicated columns or auth integration.
                  </div>
                )}
                <textarea
                  className="mt-4 w-full rounded-xl border border-slate-200 p-3 text-sm"
                  rows={4}
                  placeholder="Details / notes (affiliate, broker, assigned, sales, special instructions)"
                  value={profile.notes}
                  onChange={(e) => setProfile({ ...profile, notes: e.target.value })}
                />
                <button
                  type="button"
                  disabled={savingProfile}
                  className="mt-3 rounded-xl bg-[#2562FF] px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
                  onClick={saveProfile}
                >
                  {savingProfile ? 'Saving…' : 'Update profile'}
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
                <div className="max-h-56 space-y-2 overflow-auto text-sm text-slate-600">
                  {notesForTab.length === 0 ? (
                    <p className="text-xs text-slate-400">No notes in this channel yet.</p>
                  ) : (
                    notesForTab.map((n) => (
                      <div key={n.id} className="rounded-lg bg-slate-50 p-2 text-xs">
                        <span className="font-semibold text-slate-800">
                          {new Date(n.created_at).toLocaleString()} · {n.counselor_name || 'Staff'}
                        </span>
                        {n.received_text && (
                          <p className="mt-1 whitespace-pre-wrap text-slate-700">
                            <strong>Received:</strong> {n.received_text}
                          </p>
                        )}
                        {n.action_text && (
                          <p className="mt-1 whitespace-pre-wrap text-slate-700">
                            <strong>Action:</strong> {n.action_text}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
                {notesSub === 'sms' && (
                  <p className="text-xs text-slate-500">Log SMS-style updates here; full SMS gateway is separate.</p>
                )}
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
                    disabled={savingNote}
                    className="w-fit rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
                    onClick={addNote}
                  >
                    {savingNote ? 'Saving…' : 'Add note'}
                  </button>
                </div>

                <div className="mt-6">
                  <p className="text-xs font-bold uppercase text-slate-500">Hard-coded hot links</p>
                  <div className="mt-2 flex max-h-36 flex-wrap gap-1 overflow-auto">
                    {HARD_CODED_HOT_LINKS.map((h) => (
                      <button
                        key={h}
                        type="button"
                        className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 hover:bg-slate-200"
                        onClick={() => insertTemplate(h)}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-xs font-bold uppercase text-slate-500">Custom hot links (shared)</p>
                  <div className="mt-2 flex max-h-40 flex-wrap gap-1 overflow-auto">
                    {staffHotRows.map((row) => (
                      <span
                        key={row.id}
                        className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-900"
                      >
                        <button type="button" className="hover:underline" onClick={() => insertTemplate(row.label)}>
                          {row.label}
                        </button>
                        <button type="button" className="text-red-600 hover:text-red-800" onClick={() => removeHotDb(row.id)} aria-label="Remove">
                          ×
                        </button>
                      </span>
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
                      onClick={addHotFromDb}
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
                        {['scheduled', 'pending', 'active', 'contact1', 'contact2', 'contact3', 'complete', 'nsf', 'cancelled', 'expired'].map(
                          (s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          )
                        )}
                      </select>
                      <button
                        type="button"
                        className="rounded-lg bg-[#2562FF] px-3 py-1.5 text-sm font-semibold text-white"
                        onClick={saveStatusOnly}
                      >
                        Update
                      </button>
                    </div>
                    <label className="mt-4 block text-xs font-bold uppercase text-slate-500">Date for results</label>
                    <input
                      type="date"
                      className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                      value={resultsDate}
                      onChange={(e) => setResultsDate(e.target.value)}
                    />
                    <p className="mt-2 text-sm text-slate-600">
                      DFR (days): <strong>{dfrDays}</strong>
                    </p>
                    <button
                      type="button"
                      className="mt-3 w-full rounded-xl border border-slate-200 py-2 text-sm font-semibold shadow-sm"
                      onClick={() => navigate('/admin/appointments')}
                    >
                      Set follow-up
                    </button>
                    <div className="mt-4 border-t border-slate-100 pt-4">
                      <p className="mb-2 text-xs font-bold uppercase text-slate-500">Secure documents</p>
                      <AdminDocumentList
                        clientId={id}
                        documents={documents}
                        onReload={load}
                        showToast={showToast}
                      />
                    </div>
                  </>
                )}
                {panel === 'results' && (
                  <p className="text-sm text-slate-600">
                    Track bureau responses and scores here. Connect credit monitoring or import bureau PDFs under
                    Documents.
                  </p>
                )}
              </AdminCard>
            </div>
          </div>

          <AdminCard title="Assignments">
            <p className="text-sm text-slate-600">
              Affiliate / broker / sales / counselor assignment fields can be added to `clients` or a junction table when
              you define your CRM model.
            </p>
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
                          <div className="text-xs text-slate-500">{d.status || 'draft'}</div>
                        </li>
                      ))}
                    {disputes.filter((d) => (d.bureau || '').toLowerCase() === bureau.toLowerCase()).length === 0 && (
                      <li className="text-slate-500">No items yet.</li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </AdminCard>

          <AdminCard title="Add new account (dispute item)">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <label className="text-sm">
                Bureau
                <select
                  className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5"
                  value={disputeForm.bureau}
                  onChange={(e) => setDisputeForm({ ...disputeForm, bureau: e.target.value })}
                >
                  <option>Equifax</option>
                  <option>Experian</option>
                  <option>TransUnion</option>
                </select>
              </label>
              <label className="text-sm sm:col-span-2">
                Creditor (search sample list)
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5"
                  placeholder="Search creditors"
                  value={creditorQ}
                  onChange={(e) => setCreditorQ(e.target.value)}
                />
                <div className="mt-1 max-h-24 overflow-auto rounded border border-slate-100 bg-white text-xs">
                  {filteredCreditors.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className="block w-full px-2 py-1 text-left hover:bg-slate-50"
                      onClick={() => {
                        setSelectedCreditorName(c.name);
                        setDisputeForm({ ...disputeForm, accountName: c.name });
                      }}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </label>
              <label className="text-sm">
                Account name
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5"
                  value={disputeForm.accountName}
                  onChange={(e) => setDisputeForm({ ...disputeForm, accountName: e.target.value })}
                />
              </label>
              <label className="text-sm">
                Account # (last 4)
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5"
                  value={disputeForm.accountLast4}
                  onChange={(e) => setDisputeForm({ ...disputeForm, accountLast4: e.target.value })}
                  maxLength={4}
                />
              </label>
              <label className="text-sm">
                Beginning status
                <select
                  className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5"
                  value={disputeForm.beginningStatus}
                  onChange={(e) => setDisputeForm({ ...disputeForm, beginningStatus: e.target.value })}
                >
                  {BEGINNING_STATUSES_SAMPLE.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                Tail end / template
                <select
                  className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5"
                  value={disputeForm.tailEnd}
                  onChange={(e) => setDisputeForm({ ...disputeForm, tailEnd: e.target.value })}
                >
                  {TAIL_ENDS_SAMPLE.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className="rounded-lg bg-[#2562FF] px-4 py-2 text-sm font-semibold text-white"
                onClick={addDisputeItem}
              >
                Add dispute
              </button>
              <button
                type="button"
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
                onClick={() => {
                  setDisputeForm({
                    bureau: 'Experian',
                    accountName: '',
                    accountLast4: '',
                    beginningStatus: BEGINNING_STATUSES_SAMPLE[0],
                    tailEnd: TAIL_ENDS_SAMPLE[0],
                  });
                  setSelectedCreditorName('');
                  setCreditorQ('');
                }}
              >
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
                      {d.bureau} · {d.status || 'draft'}
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
                    <span className="text-xs text-slate-400">Template library</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-sm">
                    {['Equifax', 'Experian', 'TransUnion', '3-Bureau'].map((b) => (
                      <button
                        key={b}
                        type="button"
                        className="rounded-lg bg-slate-100 px-2 py-1 font-medium hover:bg-slate-200"
                        onClick={() => showToast(`Open template editor: ${round} · ${b}`, 'info')}
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
                  <button
                    type="button"
                    className="text-xs font-semibold text-[#2562FF]"
                    onClick={() => showToast(`Template: ${t}`, 'info')}
                  >
                    Open
                  </button>
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
                <div className="flex justify-end gap-2 md:col-span-2">
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
                  <div className="text-xs text-slate-500">Status: {payment.setup_fee_status || '—'}</div>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="text-xs font-bold uppercase text-slate-500">Monthly</div>
                  <div className="font-display text-xl font-bold">{formatCents(payment.monthly_amount)}/mo</div>
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
            <p className="text-sm text-slate-600">
              Check drafting integrates with your bank / processor. Clover card-on-file is shown above when connected.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
                onClick={() => showToast('Connect ACH / check printing provider.', 'info')}
              >
                Draft check
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
