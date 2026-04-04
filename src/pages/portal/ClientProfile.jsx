import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase, portalFetch } from '../../lib/supabase';
import CloverPaymentForm from '../../components/CloverPaymentForm';
import DisputeLetterModal from '../../components/DisputeLetterModal';

const ClientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [client, setClient] = useState(null);
  const [payment, setPayment] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [intake, setIntake] = useState(null);
  const [activeTab, setActiveTab] = useState('payments');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadClient(); }, [id]);

  const loadClient = async () => {
    setLoading(true);
    const [clientRes, paymentRes, historyRes, disputeRes, docRes, intakeRes] = await Promise.all([
      supabase.from('clients').select('*').eq('id', id).single(),
      supabase.from('payments').select('*').eq('client_id', id).single(),
      supabase.from('payment_history').select('*').eq('client_id', id).order('charged_at', { ascending: false }),
      supabase.from('dispute_letters').select('*').eq('client_id', id).order('created_at', { ascending: false }),
      supabase.from('documents').select('*').eq('client_id', id).order('created_at', { ascending: false }),
      supabase.from('intake_forms').select('*').eq('client_id', id).single(),
    ]);
    setClient(clientRes.data);
    setPayment(paymentRes.data);
    setPaymentHistory(historyRes.data || []);
    setDisputes(disputeRes.data || []);
    setDocuments(docRes.data || []);
    setIntake(intakeRes.data);
    setLoading(false);
  };

  const tabs = [
    { id: 'payments', label: '💳 Payments', count: paymentHistory.length },
    { id: 'intake', label: '📝 Intake', count: intake ? 1 : 0 },
    { id: 'credit', label: '📊 Credit Reports', count: documents.filter(d => d.type === 'credit_report').length },
    { id: 'disputes', label: '✉️ Disputes', count: disputes.length },
    { id: 'documents', label: '📁 Documents', count: documents.length },
  ];

  if (loading) {
    return (
      <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.4)' }}>Loading client...</div>
      </div>
    );
  }

  if (!client) {
    return (
      <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>❌</div>
          <h2>Client not found</h2>
          <button style={s.backBtn} onClick={() => navigate('/portal/clients')}>← Back to Directory</button>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      {/* Header */}
      <header style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.logoMark}>HRS</div>
          <span style={s.headerTitle}>Client Portal</span>
        </div>
        <nav style={s.nav}>
          <button style={s.navBtn} onClick={() => navigate('/portal')}>Dashboard</button>
          <button style={s.navBtn} onClick={() => navigate('/portal/clients')}>Clients</button>
        </nav>
        <div style={s.headerRight}>
          <span style={s.userName}>{user?.name || user?.email}</span>
          <button style={s.logoutBtn} onClick={() => { logout(); navigate('/portal/login'); }}>Sign Out</button>
        </div>
      </header>

      <main style={s.main}>
        <button style={s.backLink} onClick={() => navigate('/portal/clients')}>← Back to Directory</button>

        <div style={s.clientHeader}>
          <div style={s.clientAvatar}>
            {(client.first_name?.[0] || '?').toUpperCase()}{(client.last_name?.[0] || '').toUpperCase()}
          </div>
          <div style={s.clientHeaderInfo}>
            <h1 style={s.clientName}>{client.first_name} {client.last_name}</h1>
            <div style={s.clientMeta}>
              {client.email && <span>📧 {client.email}</span>}
              {client.phone && <span>📱 {client.phone}</span>}
              {client.city && client.state && <span>📍 {client.city}, {client.state}</span>}
            </div>
          </div>
          <div style={{
            ...s.statusPill,
            background: client.status === 'active' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
            color: client.status === 'active' ? '#10b981' : '#f59e0b',
          }}>
            {client.status || 'active'}
          </div>
        </div>

        {/* Tabs */}
        <div style={s.tabBar}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...s.tab,
                ...(activeTab === tab.id ? s.tabActive : {}),
              }}
            >
              {tab.label}
              {tab.count > 0 && <span style={s.tabCount}>{tab.count}</span>}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={s.tabContent}>
          {activeTab === 'payments' && <PaymentsTab payment={payment} history={paymentHistory} clientId={id} client={client} onReload={loadClient} />}
          {activeTab === 'intake' && <IntakeTab intake={intake} clientId={id} onReload={loadClient} />}
          {activeTab === 'credit' && <DocumentUploadTab documents={documents.filter(d => d.type === 'credit_report')} clientId={id} docType="credit_report" title="Credit Reports" icon="📊" onReload={loadClient} />}
          {activeTab === 'disputes' && <DisputesTab disputes={disputes} clientId={id} client={client} onReload={loadClient} />}
          {activeTab === 'documents' && <DocumentUploadTab documents={documents} clientId={id} docType={null} title="All Documents" icon="📁" onReload={loadClient} />}
        </div>
      </main>
    </div>
  );
};

/* ─── Payments Tab ─── */
const addOneMonth = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().split('T')[0];
};

const PaymentsTab = ({ payment, history, clientId, client, onReload }) => {
  const [editMode, setEditMode] = useState(!payment);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // Default setup date = client's actual signup date (created_at), not today
  const signupDate = client?.created_at
    ? new Date(client.created_at).toISOString().split('T')[0]
    : '';
  const defaultSetupDate = payment?.setup_fee_date || signupDate;
  const [form, setForm] = useState({
    setup_fee_amount: payment?.setup_fee_amount || '',
    setup_fee_date: defaultSetupDate,
    monthly_amount: payment?.monthly_amount || '',
    monthly_start_date: payment?.monthly_start_date || addOneMonth(defaultSetupDate),
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      client_id: clientId,
      setup_fee_amount: parseInt(form.setup_fee_amount) || 0,
      setup_fee_date: form.setup_fee_date || null,
      monthly_amount: parseInt(form.monthly_amount) || 0,
      monthly_start_date: form.monthly_start_date || null,
    };
    if (payment) {
      await supabase.from('payments').update(payload).eq('id', payment.id);
    } else {
      await supabase.from('payments').insert(payload);
    }
    setSaving(false);
    setEditMode(false);
    onReload();
  };

  const handlePaymentSuccess = () => onReload();
  const formatCents = (cents) => cents ? `$${(cents / 100).toFixed(2)}` : '$0.00';

  return (
    <div>
      {showPaymentForm && client && (
        <CloverPaymentForm
          client={client}
          onPaymentSuccess={handlePaymentSuccess}
          onClose={() => { setShowPaymentForm(false); onReload(); }}
        />
      )}

      <div style={s.card}>
        <div style={s.cardHeader}>
          <h3 style={s.cardTitle}>Payment Configuration</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(!payment || !payment.clover_customer_id) && (
              <button style={s.chargeBtn} onClick={() => setShowPaymentForm(true)}>💳 Set Up Payment</button>
            )}
            {payment && !editMode && (
              <button style={s.editBtn} onClick={() => setEditMode(true)}>Edit</button>
            )}
          </div>
        </div>

        {payment?.clover_customer_id && (
          <div style={s.cloverBadge}>
            <span style={s.cloverDot}>●</span>
            Clover Connected — Customer ID: {payment.clover_customer_id}
          </div>
        )}

        {editMode ? (
          <div style={s.formGrid}>
            <div style={s.formGroup}>
              <label style={s.formLabel}>Setup Fee (cents)</label>
              <input style={s.formInput} type="number" placeholder="e.g. 25000 for $250" value={form.setup_fee_amount} onChange={(e) => setForm({ ...form, setup_fee_amount: e.target.value })} />
            </div>
            <div style={s.formGroup}>
              <label style={s.formLabel}>Setup Fee Date</label>
              <input
                style={s.formInput}
                type="date"
                value={form.setup_fee_date}
                onChange={(e) => {
                  const newSetupDate = e.target.value;
                  setForm({ ...form, setup_fee_date: newSetupDate, monthly_start_date: addOneMonth(newSetupDate) });
                }}
              />
              <small style={s.formHint}>Leave empty or pick today for immediate charge</small>
            </div>
            <div style={s.formGroup}>
              <label style={s.formLabel}>Monthly Amount (cents)</label>
              <input style={s.formInput} type="number" placeholder="e.g. 9900 for $99" value={form.monthly_amount} onChange={(e) => setForm({ ...form, monthly_amount: e.target.value })} />
            </div>
            <div style={s.formGroup}>
              <label style={s.formLabel}>Monthly Start Date</label>
              <input
                style={{ ...s.formInput, opacity: 0.7, cursor: 'not-allowed' }}
                type="date"
                value={form.monthly_start_date}
                readOnly
              />
              <small style={s.formHint}>Auto-set to 1 month after setup date</small>
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              {payment && <button style={s.cancelBtn} onClick={() => setEditMode(false)}>Cancel</button>}
              <button style={s.saveBtn} onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Payment Config'}</button>
            </div>
          </div>
        ) : payment ? (
          <div style={s.paymentSummary}>
            <div style={s.paymentItem}>
              <div style={s.paymentLabel}>Setup Fee</div>
              <div style={s.paymentValue}>{formatCents(payment.setup_fee_amount)}</div>
              <div style={s.paymentSub}>Date: {payment.setup_fee_date || 'Immediate'} • Status: <span style={{ color: payment.setup_fee_status === 'paid' ? '#10b981' : '#f59e0b', textTransform: 'capitalize' }}>{payment.setup_fee_status}</span></div>
            </div>
            <div style={s.paymentItem}>
              <div style={s.paymentLabel}>Monthly Recurring</div>
              <div style={s.paymentValue}>{formatCents(payment.monthly_amount)}/mo</div>
              <div style={s.paymentSub}>Start: {payment.monthly_start_date || 'Not set'} • Status: <span style={{ color: payment.monthly_status === 'active' ? '#10b981' : '#f59e0b', textTransform: 'capitalize' }}>{payment.monthly_status}</span></div>
            </div>
            {payment.card_last_four && (
              <div style={s.paymentItem}>
                <div style={s.paymentLabel}>Card on File</div>
                <div style={s.paymentValue}>•••• {payment.card_last_four}</div>
                <div style={s.paymentSub}>{payment.card_brand || 'Card'}</div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      <div style={{ ...s.card, marginTop: '16px' }}>
        <div style={s.cardHeader}><h3 style={s.cardTitle}>Payment History</h3></div>
        {history.length === 0 ? (
          <div style={s.emptyTab}>No payment history yet.</div>
        ) : (
          history.map((h) => (
            <div key={h.id} style={s.historyRow}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{h.description || h.type}</div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', marginTop: '2px' }}>
                  {new Date(h.charged_at).toLocaleDateString()} {new Date(h.charged_at).toLocaleTimeString()}
                </div>
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: '600' }}>{formatCents(h.amount)}</div>
              <span style={{
                padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '600',
                background: h.status === 'succeeded' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                color: h.status === 'succeeded' ? '#10b981' : '#ef4444', marginLeft: '12px', textTransform: 'capitalize',
              }}>{h.status}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

/* ─── Intake Tab ─── */
const GOAL_OPTIONS = [
  'Buy a home',
  'Lower interest rates',
  'Remove collections',
  'Improve credit score',
  'Qualify for auto loan',
  'Other',
];

const IntakeTab = ({ intake, clientId, onReload }) => {
  const [editMode, setEditMode] = useState(!intake);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    dob: intake?.dob || '',
    ssn_last4: intake?.ssn_last4 || '',
    current_address: intake?.current_address || '',
    previous_addresses: intake?.previous_addresses || '',
    employer: intake?.employer || '',
    income: intake?.income || '',
    goals: intake?.goals || [],
    notes: intake?.notes || '',
  });

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const toggleGoal = (goal) => {
    setForm(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = { client_id: clientId, ...form };
    if (intake) {
      await supabase.from('intake_forms').update(payload).eq('id', intake.id);
    } else {
      await supabase.from('intake_forms').insert(payload);
    }
    setSaving(false);
    setEditMode(false);
    onReload();
  };

  return (
    <div style={s.card}>
      <div style={s.cardHeader}>
        <h3 style={s.cardTitle}>Client Intake Form</h3>
        {intake && !editMode && (
          <button style={s.editBtn} onClick={() => setEditMode(true)}>Edit</button>
        )}
      </div>

      {editMode ? (
        <div style={{ padding: '24px' }}>
          <div style={s.formGrid}>
            <div style={s.formGroup}>
              <label style={s.formLabel}>Date of Birth</label>
              <input style={s.formInput} type="date" value={form.dob} onChange={handleChange('dob')} />
            </div>
            <div style={s.formGroup}>
              <label style={s.formLabel}>SSN (Last 4)</label>
              <input style={s.formInput} type="text" maxLength="4" placeholder="1234" value={form.ssn_last4} onChange={handleChange('ssn_last4')} />
            </div>
            <div style={{ ...s.formGroup, gridColumn: '1 / -1' }}>
              <label style={s.formLabel}>Current Address</label>
              <input style={s.formInput} type="text" placeholder="123 Main St, Dallas, TX 75001" value={form.current_address} onChange={handleChange('current_address')} />
            </div>
            <div style={{ ...s.formGroup, gridColumn: '1 / -1' }}>
              <label style={s.formLabel}>Previous Address(es)</label>
              <input style={s.formInput} type="text" placeholder="Optional" value={form.previous_addresses} onChange={handleChange('previous_addresses')} />
            </div>
            <div style={s.formGroup}>
              <label style={s.formLabel}>Employer</label>
              <input style={s.formInput} type="text" placeholder="Current employer" value={form.employer} onChange={handleChange('employer')} />
            </div>
            <div style={s.formGroup}>
              <label style={s.formLabel}>Annual Income</label>
              <input style={s.formInput} type="text" placeholder="e.g. $55,000" value={form.income} onChange={handleChange('income')} />
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <label style={s.formLabel}>Credit Goals</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
              {GOAL_OPTIONS.map(goal => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => toggleGoal(goal)}
                  style={{
                    padding: '8px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '500',
                    cursor: 'pointer', transition: 'all 0.15s ease',
                    background: form.goals.includes(goal) ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${form.goals.includes(goal) ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.08)'}`,
                    color: form.goals.includes(goal) ? '#3b82f6' : 'rgba(255,255,255,0.5)',
                  }}
                >
                  {form.goals.includes(goal) ? '✓ ' : ''}{goal}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <label style={s.formLabel}>Notes</label>
            <textarea
              style={{ ...s.formInput, minHeight: '80px', resize: 'vertical', marginTop: '6px', width: '100%', boxSizing: 'border-box' }}
              value={form.notes}
              onChange={handleChange('notes')}
              placeholder="Any additional notes about this client..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
            {intake && <button style={s.cancelBtn} onClick={() => setEditMode(false)}>Cancel</button>}
            <button style={s.saveBtn} onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Intake'}
            </button>
          </div>
        </div>
      ) : intake ? (
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <InfoField label="Date of Birth" value={intake.dob ? new Date(intake.dob).toLocaleDateString() : '—'} />
            <InfoField label="SSN Last 4" value={intake.ssn_last4 ? `••••${intake.ssn_last4}` : '—'} />
            <InfoField label="Current Address" value={intake.current_address || '—'} full />
            <InfoField label="Previous Address" value={intake.previous_addresses || '—'} full />
            <InfoField label="Employer" value={intake.employer || '—'} />
            <InfoField label="Annual Income" value={intake.income || '—'} />
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={s.infoLabel}>Credit Goals</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                {(intake.goals || []).length > 0 ? intake.goals.map(g => (
                  <span key={g} style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '500', background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>{g}</span>
                )) : <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>No goals set</span>}
              </div>
            </div>
            {intake.notes && <InfoField label="Notes" value={intake.notes} full />}
          </div>
        </div>
      ) : null}
    </div>
  );
};

const InfoField = ({ label, value, full }) => (
  <div style={full ? { gridColumn: '1 / -1' } : {}}>
    <div style={s.infoLabel}>{label}</div>
    <div style={s.infoValue}>{value}</div>
  </div>
);

/* ─── Document Upload Tab (used for both Documents and Credit Reports) ─── */
const DOC_TYPE_OPTIONS = [
  { value: 'credit_report', label: 'Credit Report' },
  { value: 'id_doc', label: 'ID Document' },
  { value: 'utility_bill', label: 'Utility Bill' },
  { value: 'other', label: 'Other' },
];

const DocumentUploadTab = ({ documents, clientId, docType, title, icon, onReload }) => {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [selectedType, setSelectedType] = useState(docType || 'other');

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate
    if (file.size > 10 * 1024 * 1024) {
      alert('File must be under 10MB');
      return;
    }
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowed.includes(file.type)) {
      alert('Only PDF, JPG, and PNG files are accepted');
      return;
    }

    setUploading(true);
    try {
      // 1. Get signed upload URL from server
      const urlRes = await portalFetch('/api/documents/upload-url', {
        method: 'POST',
        body: JSON.stringify({ clientId, fileName: file.name, fileType: file.type, docType: selectedType }),
      });

      const contentType = urlRes.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // Dev mode fallback: upload directly via Supabase client
        await directUpload(file);
        return;
      }

      const urlData = await urlRes.json();
      if (!urlRes.ok) throw new Error(urlData.error);

      // 2. Upload file to signed URL
      const uploadRes = await fetch(urlData.signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!uploadRes.ok) throw new Error('Upload failed');

      // 3. Get public URL
      const { data: urlObj } = supabase.storage.from('client-documents').getPublicUrl(urlData.filePath);

      // 4. Save document record
      await supabase.from('documents').insert({
        client_id: clientId,
        name: file.name,
        type: selectedType,
        file_url: urlObj.publicUrl,
        file_path: urlData.filePath,
        file_size: file.size,
      });

      onReload();
    } catch (err) {
      console.error('Upload error:', err);
      await directUpload(file);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // Fallback for dev mode (no serverless functions)
  const directUpload = async (file) => {
    try {
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = `${clientId}/${timestamp}_${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from('client-documents')
        .upload(filePath, file);

      if (uploadError) {
        alert('Upload failed: ' + uploadError.message);
        setUploading(false);
        return;
      }

      const { data: urlObj } = supabase.storage.from('client-documents').getPublicUrl(filePath);

      await supabase.from('documents').insert({
        client_id: clientId,
        name: file.name,
        type: selectedType,
        file_url: urlObj.publicUrl,
        file_path: filePath,
        file_size: file.size,
      });

      onReload();
    } catch (err) {
      alert('Upload error: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!confirm('Delete this document?')) return;
    setDeleting(docId);
    try {
      const res = await portalFetch('/api/documents/delete-document', {
        method: 'DELETE',
        body: JSON.stringify({ documentId: docId }),
      });
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // Dev fallback
        const doc = documents.find(d => d.id === docId);
        if (doc?.file_path) {
          await supabase.storage.from('client-documents').remove([doc.file_path]);
        }
        await supabase.from('documents').delete().eq('id', docId);
      }
      onReload();
    } catch {
      await supabase.from('documents').delete().eq('id', docId);
      onReload();
    }
    setDeleting(null);
  };

  const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div style={s.card}>
      <div style={s.cardHeader}>
        <h3 style={s.cardTitle}>{title}</h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {!docType && (
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{ ...s.formInput, padding: '6px 10px', fontSize: '0.8rem', borderRadius: '8px' }}
            >
              {DOC_TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          )}
          <label style={s.uploadBtn}>
            {uploading ? '⏳ Uploading...' : `📎 Upload ${docType === 'credit_report' ? 'Report' : 'File'}`}
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleUpload} style={{ display: 'none' }} disabled={uploading} />
          </label>
        </div>
      </div>

      {documents.length === 0 ? (
        <div style={s.emptyTab}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{icon}</div>
          <p>No {title.toLowerCase()} uploaded yet.</p>
          <small style={{ color: 'rgba(255,255,255,0.3)' }}>Upload PDF, JPG, or PNG files up to 10MB.</small>
        </div>
      ) : (
        documents.map((d) => (
          <div key={d.id} style={s.historyRow}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{d.name}</div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', marginTop: '2px' }}>
                {d.type && <span style={{ textTransform: 'capitalize' }}>{d.type.replace(/_/g, ' ')} • </span>}
                {formatSize(d.file_size)} • Uploaded {new Date(d.created_at).toLocaleDateString()}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {d.file_url && (
                <a href={d.file_url} target="_blank" rel="noopener noreferrer" style={s.downloadBtn}>↓ Download</a>
              )}
              <button
                style={s.deleteBtn}
                onClick={() => handleDelete(d.id)}
                disabled={deleting === d.id}
              >
                {deleting === d.id ? '...' : '✕'}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

/* ─── Disputes Tab ─── */
const DISPUTE_REASONS = ['Not mine', 'Inaccurate balance', 'Paid/settled', 'Outdated', 'Duplicate', 'Identity theft', 'Other'];
const STATUS_FLOW = ['draft', 'sent', 'responded', 'resolved'];

const DisputesTab = ({ disputes, clientId, client, onReload }) => {
  const [showForm, setShowForm] = useState(false);
  const [letterDispute, setLetterDispute] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    bureau: 'Experian',
    account_name: '',
    account_number_last4: '',
    dispute_reason: 'Not mine',
    notes: '',
  });

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleAdd = async () => {
    if (!form.account_name) return alert('Account name is required');
    setSaving(true);
    const maxRound = disputes.filter(d => d.bureau === form.bureau && d.account_name === form.account_name).length;
    await supabase.from('dispute_letters').insert({
      client_id: clientId,
      ...form,
      round_number: maxRound + 1,
      status: 'draft',
    });
    setSaving(false);
    setShowForm(false);
    setForm({ bureau: 'Experian', account_name: '', account_number_last4: '', dispute_reason: 'Not mine', notes: '' });
    onReload();
  };

  const advanceStatus = async (dispute) => {
    const idx = STATUS_FLOW.indexOf(dispute.status);
    if (idx < STATUS_FLOW.length - 1) {
      const newStatus = STATUS_FLOW[idx + 1];
      const updates = { status: newStatus };
      if (newStatus === 'sent') updates.sent_date = new Date().toISOString().split('T')[0];
      if (newStatus === 'responded') updates.response_date = new Date().toISOString().split('T')[0];
      await supabase.from('dispute_letters').update(updates).eq('id', dispute.id);
      onReload();
    }
  };

  const handleSaveLetter = async (letterText) => {
    await supabase.from('dispute_letters').update({ letter_text: letterText }).eq('id', letterDispute.id);
    setLetterDispute(null);
    onReload();
  };

  const statusColor = (status) => {
    const map = { draft: '#f59e0b', sent: '#3b82f6', responded: '#8b5cf6', resolved: '#10b981' };
    return map[status] || '#6b7280';
  };

  return (
    <div>
      {letterDispute && (
        <DisputeLetterModal
          dispute={letterDispute}
          client={client}
          onSave={handleSaveLetter}
          onClose={() => setLetterDispute(null)}
        />
      )}

      <div style={s.card}>
        <div style={s.cardHeader}>
          <h3 style={s.cardTitle}>Dispute Letters</h3>
          <button style={s.addDisputeBtn} onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ New Dispute'}
          </button>
        </div>

        {/* New Dispute Form */}
        {showForm && (
          <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={s.formGrid}>
              <div style={s.formGroup}>
                <label style={s.formLabel}>Bureau</label>
                <select style={s.formInput} value={form.bureau} onChange={handleChange('bureau')}>
                  <option>Experian</option>
                  <option>Equifax</option>
                  <option>TransUnion</option>
                </select>
              </div>
              <div style={s.formGroup}>
                <label style={s.formLabel}>Dispute Reason</label>
                <select style={s.formInput} value={form.dispute_reason} onChange={handleChange('dispute_reason')}>
                  {DISPUTE_REASONS.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div style={s.formGroup}>
                <label style={s.formLabel}>Account Name</label>
                <input style={s.formInput} placeholder="e.g. Capital One, Midland Credit" value={form.account_name} onChange={handleChange('account_name')} />
              </div>
              <div style={s.formGroup}>
                <label style={s.formLabel}>Account # (Last 4)</label>
                <input style={s.formInput} maxLength="4" placeholder="1234" value={form.account_number_last4} onChange={handleChange('account_number_last4')} />
              </div>
              <div style={{ ...s.formGroup, gridColumn: '1 / -1' }}>
                <label style={s.formLabel}>Notes</label>
                <input style={s.formInput} placeholder="Optional notes" value={form.notes} onChange={handleChange('notes')} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
              <button style={s.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
              <button style={s.saveBtn} onClick={handleAdd} disabled={saving}>{saving ? 'Adding...' : 'Add Dispute'}</button>
            </div>
          </div>
        )}

        {/* Dispute List */}
        {disputes.length === 0 && !showForm ? (
          <div style={s.emptyTab}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✉️</div>
            <p>No dispute letters yet.</p>
            <small style={{ color: 'rgba(255,255,255,0.3)' }}>Create and track dispute letters for credit bureaus.</small>
          </div>
        ) : (
          disputes.map((d) => (
            <div key={d.id} style={s.historyRow}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{d.bureau} — {d.account_name || 'General'}</div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', marginTop: '2px' }}>
                  {d.dispute_reason} • Round {d.round_number || 1} • {new Date(d.created_at).toLocaleDateString()}
                  {d.sent_date && ` • Sent ${new Date(d.sent_date).toLocaleDateString()}`}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button style={s.genLetterBtn} onClick={() => setLetterDispute(d)}>
                  {d.letter_text ? '📄 View Letter' : '✉️ Generate Letter'}
                </button>
                <button
                  onClick={() => advanceStatus(d)}
                  disabled={d.status === 'resolved'}
                  style={{
                    padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600',
                    background: `${statusColor(d.status)}18`, color: statusColor(d.status),
                    border: `1px solid ${statusColor(d.status)}30`, cursor: d.status === 'resolved' ? 'default' : 'pointer',
                    textTransform: 'capitalize', transition: 'all 0.15s ease',
                  }}
                  title={d.status !== 'resolved' ? `Click to advance to "${STATUS_FLOW[STATUS_FLOW.indexOf(d.status) + 1]}"` : 'Completed'}
                >
                  {d.status}
                  {d.status !== 'resolved' && ' →'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

/* ─── Styles ─── */
const s = {
  page: { minHeight: '100vh', background: '#0a0a1a', color: '#fff', fontFamily: "'Inter', -apple-system, sans-serif" },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: '64px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(20px)' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  logoMark: { width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: '800', color: '#fff' },
  headerTitle: { fontSize: '0.95rem', fontWeight: '600', color: 'rgba(255,255,255,0.9)' },
  nav: { display: 'flex', gap: '4px' },
  navBtn: { padding: '8px 16px', background: 'transparent', border: 'none', borderRadius: '8px', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', fontWeight: '500', cursor: 'pointer' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  userName: { fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' },
  logoutBtn: { padding: '6px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', cursor: 'pointer' },
  main: { maxWidth: '1000px', margin: '0 auto', padding: '32px' },
  backLink: { background: 'none', border: 'none', color: '#3b82f6', fontSize: '0.85rem', cursor: 'pointer', padding: 0, marginBottom: '20px', display: 'block' },
  backBtn: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', padding: '10px 20px', cursor: 'pointer', marginTop: '16px', fontSize: '0.85rem' },
  clientHeader: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px', padding: '28px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px' },
  clientAvatar: { width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: '700', flexShrink: 0 },
  clientHeaderInfo: { flex: 1 },
  clientName: { fontSize: '1.5rem', fontWeight: '700', margin: '0 0 6px', letterSpacing: '-0.02em' },
  clientMeta: { display: 'flex', gap: '20px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', flexWrap: 'wrap' },
  statusPill: { padding: '6px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', textTransform: 'capitalize', alignSelf: 'flex-start' },
  tabBar: { display: 'flex', gap: '4px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' },
  tab: { padding: '10px 18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.15s ease' },
  tabActive: { background: 'rgba(59,130,246,0.1)', borderColor: 'rgba(59,130,246,0.3)', color: '#3b82f6' },
  tabCount: { background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '600' },
  tabContent: {},
  card: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  cardTitle: { fontSize: '1rem', fontWeight: '600', margin: 0 },
  editBtn: { background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px', color: '#3b82f6', padding: '6px 14px', fontSize: '0.8rem', fontWeight: '500', cursor: 'pointer' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  formLabel: { fontSize: '0.8rem', fontWeight: '500', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' },
  formInput: { padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' },
  formHint: { fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' },
  cancelBtn: { padding: '10px 18px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', cursor: 'pointer' },
  saveBtn: { padding: '10px 20px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(59,130,246,0.25)' },
  paymentSummary: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0' },
  paymentItem: { padding: '24px', borderRight: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  paymentLabel: { fontSize: '0.75rem', fontWeight: '600', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' },
  paymentValue: { fontSize: '1.5rem', fontWeight: '700', marginBottom: '4px' },
  paymentSub: { fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' },
  historyRow: { display: 'flex', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  emptyTab: { padding: '48px', textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' },
  chargeBtn: { padding: '8px 16px', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 8px rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', gap: '4px' },
  cloverBadge: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', background: 'rgba(16,185,129,0.05)', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' },
  cloverDot: { color: '#10b981', fontSize: '0.6rem' },
  infoLabel: { fontSize: '0.75rem', fontWeight: '600', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' },
  infoValue: { fontSize: '0.9rem', color: '#fff' },
  uploadBtn: { padding: '8px 16px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 8px rgba(59,130,246,0.25)' },
  downloadBtn: { padding: '4px 10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#3b82f6', fontSize: '0.75rem', fontWeight: '500', textDecoration: 'none', cursor: 'pointer' },
  deleteBtn: { width: '28px', height: '28px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', color: '#ef4444', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  addDisputeBtn: { padding: '8px 16px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 8px rgba(59,130,246,0.25)' },
  genLetterBtn: { padding: '4px 12px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '8px', color: '#8b5cf6', fontSize: '0.75rem', fontWeight: '500', cursor: 'pointer' },
};

export default ClientProfile;
