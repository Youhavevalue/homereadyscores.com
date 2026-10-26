import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useAdminToast } from '../context/AdminToastContext';
import DisputeLetterModal from '../../components/DisputeLetterModal';
import { AdminCard } from '../components/AdminCard';
import ClientFollowUp from '../components/ClientFollowUp';
import AdminDocumentList from '../components/AdminDocumentList';
import {
  HARD_CODED_HOT_LINKS,
  BEGINNING_STATUSES_SAMPLE,
  TAIL_ENDS_SAMPLE,
} from '../constants/hotLinks';
import { BUREAU_LETTER_ROUNDS, CREDITOR_LETTER_TYPES } from '../constants/letterRounds';
import {
  insertClientNote,
  insertStaffHotLink,
  deleteStaffHotLink,
} from '../lib/adminData';

const TABS = [
  { id: 'status', label: 'Client status' },
  { id: 'all', label: 'All items' },
  { id: 'open', label: 'Open only' },
  { id: 'letters', label: 'Letters' },
  { id: 'billing', label: 'Billing' },
];

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
  const [clientNotes, setClientNotes] = useState([]);
  const [staffHotRows, setStaffHotRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const loadVersion = useRef(0);
  const [notesLoading, setNotesLoading] = useState(true);
  const [savingDispute, setSavingDispute] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [notesError, setNotesError] = useState('');
  const [hotLinksError, setHotLinksError] = useState('');
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [tab, setTab] = useState('status');
  const [notesSub, setNotesSub] = useState('notes');
  const [panel, setPanel] = useState('actions');
  const [trackerLayout, setTrackerLayout] = useState('vertical');
  const [showSSN, setShowSSN] = useState(false);
  const [extraFields, setExtraFields] = useState(false);
  const [modalDispute, setModalDispute] = useState(null);
  const [newNote, setNewNote] = useState({ received: '', action: '' });
  const [newHot, setNewHot] = useState('');
  const [resultsDate, setResultsDate] = useState('');
  const [clientStatus, setClientStatus] = useState('');
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

  const readNotes = async () => {
    const result = await supabase.from('client_notes').select('*').eq('client_id', id)
      .eq('note_type', notesSub).order('created_at', { ascending: false }).limit(200);
    if (result.error) throw new Error(result.error.message);
    return result.data || [];
  };

  const readHotLinks = async () => {
    const result = await supabase.from('staff_hot_links').select('*')
      .order('sort_order', { ascending: true }).order('created_at', { ascending: true }).limit(200);
    if (result.error) throw new Error(result.error.message);
    return result.data || [];
  };

  const load = async () => {
    const version = ++loadVersion.current;
    setLoading(true);
    setLoadError('');
    try {
      const results = await Promise.all([
        supabase.from('clients').select('*').eq('id', id).single(),
        supabase.from('payments').select('*').eq('client_id', id).maybeSingle(),
        supabase.from('payment_history').select('*').eq('client_id', id).order('charged_at', { ascending: false }).limit(200),
        supabase.from('dispute_letters').select('*').eq('client_id', id).order('created_at', { ascending: false }).limit(200),
        supabase.from('intake_forms').select('*').eq('client_id', id).maybeSingle(),
      ]);
      if (version !== loadVersion.current) return false;
      const failed = results.find((result) => result.error);
      if (failed) throw new Error(failed.error.message);
      const [cr, pr, hr, dr, intakeRes] = results;
      if (!cr.data) throw new Error('Client not found or unavailable.');
      const c = cr.data;
      setClient(c);
      setPayment(pr.data);
      setPaymentHistory(hr.data || []);
      setDisputes(dr.data || []);
      setIntake(intakeRes.data);
      setProfile(Object.fromEntries(['first_name', 'last_name', 'email', 'phone', 'address', 'city', 'state', 'zip', 'notes']
        .map((field) => [field, c[field] || ''])));
      setClientStatus(c.status || '');
      setResultsDate(c.results_expected_date || '');
      setDob(intakeRes.data?.form_data?.dob || '');
      return true;
    } catch (error) {
      if (version === loadVersion.current) setLoadError(error.message || 'Client data could not be loaded. Please retry.');
      return false;
    } finally {
      if (version === loadVersion.current) setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    return () => { loadVersion.current += 1; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    setNotesError('');
    setNotesLoading(true);
    setClientNotes([]);
    void readNotes().then((rows) => { if (!cancelled) setClientNotes(rows); })
      .catch((error) => { if (!cancelled) setNotesError(error.message || 'Notes could not be loaded.'); })
      .finally(() => { if (!cancelled) setNotesLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch for client or note category
  }, [id, notesSub]);

  useEffect(() => {
    let cancelled = false;
    setHotLinksError('');
    setStaffHotRows([]);
    void readHotLinks().then((rows) => { if (!cancelled) setStaffHotRows(rows); })
      .catch((error) => { if (!cancelled) setHotLinksError(error.message || 'Custom templates could not be loaded.'); });
    return () => { cancelled = true; };
  }, [id]);

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

  const updateClient = async (payload) => {
    if (!client?.updated_at || !Number.isFinite(Date.parse(client.updated_at))) throw new Error('Client version is unavailable. Reload before saving.');
    const updatedAt = new Date(Math.max(Date.now(), Date.parse(client.updated_at) + 1)).toISOString();
    const result = await supabase.from('clients').update({ ...payload, updated_at: updatedAt })
      .eq('id', id).eq('updated_at', client.updated_at).select('*').single();
    if (result.error) throw new Error(result.error.message);
    if (!result.data) throw new Error('Client changed or is unavailable. Reload before saving.');
    setClient(result.data);
    return result.data;
  };

  const saveProfile = async () => {
    if (savingProfile) return;
    setSavingProfile(true);
    let contactSaved = false;
    try {
      if (!profile.first_name.trim() || !profile.last_name.trim()) throw new Error('First and last name are required.');
      await updateClient({
        ...Object.fromEntries(Object.entries(profile).map(([key, value]) => [key, value.trim() || null])),
        results_expected_date: resultsDate || null,
      });
      contactSaved = true;
      if (dob || intake) {
        const payload = { form_data: { ...(intake?.form_data || {}), dob: dob || null }, updated_at: new Date().toISOString() };
        let query;
        if (intake?.id) {
          query = supabase.from('intake_forms').update(payload).eq('id', intake.id);
          if (intake.updated_at) query = query.eq('updated_at', intake.updated_at);
        } else {
          query = supabase.from('intake_forms').insert({ client_id: id, ...payload });
        }
        const result = await query.select('*').single();
        if (result.error) throw new Error(result.error.message);
        if (!result.data) throw new Error('Intake record changed or is unavailable. Reload before saving.');
        setIntake(result.data);
      }
      showToast('Client profile updated.', 'success');
    } catch (error) {
      showToast(`${contactSaved ? 'Contact details saved; DOB was not saved. ' : ''}${error.message || 'Update failed.'} Your draft remains available.`, 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const saveStatusOnly = async () => {
    if (savingStatus) return;
    setSavingStatus(true);
    try {
      await updateClient({ status: clientStatus });
      showToast('Status updated.', 'success');
    } catch (error) {
      showToast(error.message || 'Status could not be saved. Your selection remains available.', 'error');
    } finally {
      setSavingStatus(false);
    }
  };

  const addNote = async () => {
    if (savingNote) return;
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
      showToast('Note saved.', 'success');
      try {
        setClientNotes(await readNotes());
        setNotesError('');
      } catch (error) { setNotesError(`Note saved, but the list could not be refreshed: ${error.message}`); }
    } catch (e) {
      showToast(e.message || 'Note could not be saved. Your draft remains available.', 'error');
    }
    setSavingNote(false);
  };

  const addHotFromDb = async () => {
    if (!newHot.trim()) return;
    try {
      await insertStaffHotLink(newHot.trim());
      setNewHot('');
      setStaffHotRows(await readHotLinks());
      setHotLinksError('');
      showToast('Hot link added.', 'success');
    } catch (e) {
      showToast(e.message || 'Failed', 'error');
    }
  };

  const removeHotDb = async (hid) => {
    try {
      await deleteStaffHotLink(hid);
      setStaffHotRows(await readHotLinks());
      setHotLinksError('');
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
    if (savingDispute) return;
    const name = disputeForm.accountName;
    if (!name?.trim()) {
      showToast('Enter the creditor / account name from the reviewed credit report.', 'error');
      return;
    }
    setSavingDispute(true);
    try {
      const { data, error } = await supabase.from('dispute_letters').insert({
        client_id: id,
        bureau: disputeForm.bureau,
        account_name: name.trim(),
        account_number_last4: (disputeForm.accountLast4 || '').slice(-4) || null,
        dispute_reason: disputeForm.beginningStatus,
        status: 'draft',
        notes: disputeForm.tailEnd,
        round_number: 1,
      }).select('*').single();
      if (error) throw error;
      if (!data) throw new Error('Could not confirm the dispute item was saved.');
      setDisputes((rows) => [data, ...rows]);
      showToast('Dispute item added.', 'success');
      setDisputeForm({
        ...disputeForm,
        accountName: '',
        accountLast4: '',
      });
    } catch (e) {
      showToast(e.message || 'Insert failed. Your draft remains available.', 'error');
    } finally { setSavingDispute(false); }
  };

  const formatCents = (cents) => (cents ? `$${(cents / 100).toFixed(2)}` : '$0.00');

  const saveLetterText = async (letterText) => {
    if (!modalDispute) return;
    try {
      let query = supabase.from('dispute_letters').update({ letter_text: letterText, updated_at: new Date().toISOString() })
        .eq('id', modalDispute.id);
      if (modalDispute.updated_at) query = query.eq('updated_at', modalDispute.updated_at);
      const result = await query.select('*').single();
      if (result.error) throw new Error(result.error.message);
      if (!result.data) throw new Error('Letter changed or is unavailable. Reload before saving.');
      setDisputes((rows) => rows.map((row) => row.id === result.data.id ? result.data : row));
      setModalDispute(null);
      showToast('Letter draft saved.', 'success');
    } catch (error) {
      showToast(error.message || 'Letter could not be saved. Your draft remains open.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-slate-500">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#2562FF] border-t-transparent" />
        <p className="text-sm">Loading client…</p>
      </div>
    );
  }

  if (loadError) {
    return <div className="space-y-3"><p role="alert" className="rounded bg-red-50 p-3 text-red-800">{loadError}</p>
      <button type="button" onClick={load} className="rounded border px-4 py-2">Reload client</button></div>;
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
            {client.status || 'Status not recorded'}
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

        <div hidden={tab !== 'status'} className="space-y-6">
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
                        {showSSN && intake?.form_data?.ssn_last4 ? `***-**-${intake.form_data.ssn_last4}` : '••••••••'}
                      </span>
                      <button
                        type="button"
                        className="text-xs font-semibold text-[#2562FF]"
                        onClick={() => setShowSSN(!showSSN)}
                      >
                        {intake?.form_data?.ssn_last4 ? 'Toggle' : '—'}
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
                    disabled title="Customer messaging is paused."
                  >
                    Welcome email paused
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
                    Additional client portal fields are unavailable. Do not place credentials or identity/report originals in notes.
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
              {notesError && <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-800">{notesError}</p>}
              {hotLinksError && <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-800">{hotLinksError}</p>}
              <AdminCard
                title="Notes & communication"
                actions={
                  <div className="flex gap-1">
                    {['notes', 'sms', 'internal'].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setNotesSub(n)}
                        disabled={savingNote}
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
                  {notesLoading ? <p className="text-xs text-slate-500">Loading notes…</p> : notesError ? (
                    <button type="button" className="text-xs underline" onClick={async () => {
                      setNotesLoading(true);
                      try { setClientNotes(await readNotes()); setNotesError(''); }
                      catch (error) { setNotesError(error.message || 'Notes could not be loaded.'); }
                      finally { setNotesLoading(false); }
                    }}>Reload notes</button>
                  ) : notesForTab.length === 0 ? (
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
                  <p className="text-xs text-slate-500">Record an SMS contact note here. Saving a note does not send a message.</p>
                )}
                <div className="mt-4 grid gap-2 border-t border-slate-100 pt-4">
                  <p className="text-xs font-bold uppercase text-slate-500">Add new note</p>
                  <p className="text-xs text-slate-500">Private case log only. Saving does not contact the client.</p>
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
                  <p className="text-xs font-bold uppercase text-slate-500">Note shortcuts</p>
                  <p className="mt-1 text-xs text-slate-500">Shortcuts insert text into the note draft; they do not perform the described action.</p>
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
                  <p className="text-xs font-bold uppercase text-slate-500">Shared note templates</p>
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
                  <div hidden={panel !== 'actions'}>
                    <button type="button" className="mb-3 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold" onClick={() => navigate(`/admin/contracts?clientId=${id}`)}>Prepare client contract</button>
                    <label className="text-xs font-bold uppercase text-slate-500">Status</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <select
                        className="flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                        value={clientStatus}
                        onChange={(e) => setClientStatus(e.target.value)}
                      >
                        {[...new Set([clientStatus, 'scheduled', 'pending', 'active', 'contact1', 'contact2', 'contact3', 'complete', 'nsf', 'cancelled', 'expired'])].map(
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
                        title="Service activation remains paused pending the approved agreement and procedure."
                        disabled={savingStatus}
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
                      onClick={() => setShowFollowUp((value) => !value)}
                    >
                      Set follow-up
                    </button>
                    <div className="mt-4 border-t border-slate-100 pt-4">
                      <p className="mb-2 text-xs font-bold uppercase text-slate-500">Private documents</p>
                      <AdminDocumentList key={client.id} clientId={client.id} showToast={showToast} />
                    </div>
                  </div>
                {panel === 'results' && (
                  <p className="text-sm text-slate-600">
                    Stored dispute statuses appear in All items. Automatic credit-monitoring imports are paused. Staff can upload private files from Actions.
                  </p>
                )}
              </AdminCard>
            </div>
          </div>

          {showFollowUp && <ClientFollowUp key={client.id} client={client}
            showToast={showToast} onSaved={(savedClient) => { setClient(savedClient); setShowFollowUp(false); }} />}
        </div>

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
              <label className="text-sm">
                Account name
                <input
                  name="account_name"
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
                disabled={savingDispute}
              >
                {savingDispute ? 'Saving…' : 'Add dispute'}
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
                    <span className="text-xs text-slate-400">Template library editing unavailable</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-sm">
                    {['Equifax', 'Experian', 'TransUnion', '3-Bureau'].map((b) => (
                      <button
                        key={b}
                        type="button"
                        className="rounded-lg bg-slate-100 px-2 py-1 font-medium hover:bg-slate-200"
                        disabled title="Template library editing is not available. Open a stored dispute letter instead."
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
                    disabled title="Template library editing is not available."
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
          <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Billing is read-only. Card setup, charges, payment editing and check drafting are paused.</p>
          <AdminCard title="Stored payment reference">
            {payment ? <div className="grid gap-4 sm:grid-cols-2">
              <div><p className="text-xs uppercase text-slate-500">Initial fee reference</p><strong>{formatCents(payment.setup_fee_amount)}</strong><p>{payment.setup_fee_status || 'Status not recorded'}</p></div>
              <div><p className="text-xs uppercase text-slate-500">Monthly reference</p><strong>{formatCents(payment.monthly_amount)}</strong><p>{payment.monthly_status || 'Status not recorded'}</p></div>
            </div> : <p>No stored payment record.</p>}
          </AdminCard>
          <AdminCard title="Stored transactions">
            {paymentHistory.length ? <ul className="divide-y divide-slate-100">{paymentHistory.map((history) => <li key={history.id} className="flex justify-between py-2 text-sm"><span>{history.description || history.type} · {history.status || 'Status not recorded'}</span><span>{formatCents(history.amount)}</span></li>)}</ul> : <p>No stored transactions.</p>}
            <p className="mt-3 text-xs text-slate-500">Newest 200 stored transactions.</p>
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
