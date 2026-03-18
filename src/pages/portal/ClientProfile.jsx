import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import CloverPaymentForm from '../../components/CloverPaymentForm';

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
        {/* Back Button + Client Header */}
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
          {activeTab === 'credit' && <CreditTab documents={documents.filter(d => d.type === 'credit_report')} clientId={id} onReload={loadClient} />}
          {activeTab === 'disputes' && <DisputesTab disputes={disputes} clientId={id} onReload={loadClient} />}
          {activeTab === 'documents' && <DocumentsTab documents={documents} clientId={id} onReload={loadClient} />}
        </div>
      </main>
    </div>
  );
};

/* ─── Payments Tab ─── */
const PaymentsTab = ({ payment, history, clientId, client, onReload }) => {
  const [editMode, setEditMode] = useState(!payment);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [form, setForm] = useState({
    setup_fee_amount: payment?.setup_fee_amount || '',
    setup_fee_date: payment?.setup_fee_date || '',
    monthly_amount: payment?.monthly_amount || '',
    monthly_start_date: payment?.monthly_start_date || '',
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

  const handlePaymentSuccess = (result) => {
    console.log('Payment processed successfully:', result);
    onReload();
  };

  const formatCents = (cents) => {
    if (!cents) return '$0.00';
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <div>
      {/* Clover Payment Modal */}
      {showPaymentForm && client && (
        <CloverPaymentForm
          client={client}
          onPaymentSuccess={handlePaymentSuccess}
          onClose={() => { setShowPaymentForm(false); onReload(); }}
        />
      )}

      {/* Payment Config Card */}
      <div style={s.card}>
        <div style={s.cardHeader}>
          <h3 style={s.cardTitle}>Payment Configuration</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(!payment || !payment.clover_customer_id) && (
              <button
                style={s.chargeBtn}
                onClick={() => setShowPaymentForm(true)}
              >
                💳 Set Up Payment
              </button>
            )}
            {payment && !editMode && (
              <button style={s.editBtn} onClick={() => setEditMode(true)}>Edit</button>
            )}
          </div>
        </div>

        {/* Clover Status Badge */}
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
              <input
                style={s.formInput}
                type="number"
                placeholder="e.g. 25000 for $250"
                value={form.setup_fee_amount}
                onChange={(e) => setForm({ ...form, setup_fee_amount: e.target.value })}
              />
            </div>
            <div style={s.formGroup}>
              <label style={s.formLabel}>Setup Fee Date</label>
              <input
                style={s.formInput}
                type="date"
                value={form.setup_fee_date}
                onChange={(e) => setForm({ ...form, setup_fee_date: e.target.value })}
              />
              <small style={s.formHint}>Leave empty or pick today for immediate charge</small>
            </div>
            <div style={s.formGroup}>
              <label style={s.formLabel}>Monthly Amount (cents)</label>
              <input
                style={s.formInput}
                type="number"
                placeholder="e.g. 9900 for $99"
                value={form.monthly_amount}
                onChange={(e) => setForm({ ...form, monthly_amount: e.target.value })}
              />
            </div>
            <div style={s.formGroup}>
              <label style={s.formLabel}>Monthly Start Date</label>
              <input
                style={s.formInput}
                type="date"
                value={form.monthly_start_date}
                onChange={(e) => setForm({ ...form, monthly_start_date: e.target.value })}
              />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              {payment && <button style={s.cancelBtn} onClick={() => setEditMode(false)}>Cancel</button>}
              <button style={s.saveBtn} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Payment Config'}
              </button>
            </div>
          </div>
        ) : payment ? (
          <div style={s.paymentSummary}>
            <div style={s.paymentItem}>
              <div style={s.paymentLabel}>Setup Fee</div>
              <div style={s.paymentValue}>{formatCents(payment.setup_fee_amount)}</div>
              <div style={s.paymentSub}>
                Date: {payment.setup_fee_date || 'Immediate'} • Status: <span style={{ color: payment.setup_fee_status === 'paid' ? '#10b981' : '#f59e0b', textTransform: 'capitalize' }}>{payment.setup_fee_status}</span>
              </div>
            </div>
            <div style={s.paymentItem}>
              <div style={s.paymentLabel}>Monthly Recurring</div>
              <div style={s.paymentValue}>{formatCents(payment.monthly_amount)}/mo</div>
              <div style={s.paymentSub}>
                Start: {payment.monthly_start_date || 'Not set'} • Status: <span style={{ color: payment.monthly_status === 'active' ? '#10b981' : '#f59e0b', textTransform: 'capitalize' }}>{payment.monthly_status}</span>
              </div>
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

      {/* Payment History */}
      <div style={{ ...s.card, marginTop: '16px' }}>
        <div style={s.cardHeader}>
          <h3 style={s.cardTitle}>Payment History</h3>
        </div>
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
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '0.7rem',
                fontWeight: '600',
                background: h.status === 'succeeded' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                color: h.status === 'succeeded' ? '#10b981' : '#ef4444',
                marginLeft: '12px',
                textTransform: 'capitalize',
              }}>
                {h.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const formatCentsG = (cents) => {
  if (!cents) return '$0.00';
  return `$${(cents / 100).toFixed(2)}`;
};

/* ─── Intake Tab ─── */
const IntakeTab = ({ intake, clientId, onReload }) => (
  <div style={s.card}>
    <div style={s.cardHeader}>
      <h3 style={s.cardTitle}>Client Intake Form</h3>
    </div>
    <div style={s.emptyTab}>
      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📝</div>
      <p>Intake forms coming soon.</p>
      <small style={{ color: 'rgba(255,255,255,0.3)' }}>This feature will allow you to capture client information digitally.</small>
    </div>
  </div>
);

/* ─── Credit Reports Tab ─── */
const CreditTab = ({ documents, clientId, onReload }) => (
  <div style={s.card}>
    <div style={s.cardHeader}>
      <h3 style={s.cardTitle}>Credit Reports</h3>
    </div>
    {documents.length === 0 ? (
      <div style={s.emptyTab}>
        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📊</div>
        <p>No credit reports uploaded yet.</p>
        <small style={{ color: 'rgba(255,255,255,0.3)' }}>Upload and track credit reports for this client.</small>
      </div>
    ) : (
      documents.map((d) => (
        <div key={d.id} style={s.historyRow}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{d.name}</div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', marginTop: '2px' }}>
              Uploaded {new Date(d.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      ))
    )}
  </div>
);

/* ─── Disputes Tab ─── */
const DisputesTab = ({ disputes, clientId, onReload }) => (
  <div style={s.card}>
    <div style={s.cardHeader}>
      <h3 style={s.cardTitle}>Dispute Letters</h3>
    </div>
    {disputes.length === 0 ? (
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
              {d.dispute_reason} • Created {new Date(d.created_at).toLocaleDateString()}
            </div>
          </div>
          <span style={{
            padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '600',
            background: d.status === 'sent' ? 'rgba(59,130,246,0.1)' : d.status === 'resolved' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
            color: d.status === 'sent' ? '#3b82f6' : d.status === 'resolved' ? '#10b981' : '#f59e0b',
            textTransform: 'capitalize',
          }}>
            {d.status}
          </span>
        </div>
      ))
    )}
  </div>
);

/* ─── Documents Tab ─── */
const DocumentsTab = ({ documents, clientId, onReload }) => (
  <div style={s.card}>
    <div style={s.cardHeader}>
      <h3 style={s.cardTitle}>All Documents</h3>
    </div>
    {documents.length === 0 ? (
      <div style={s.emptyTab}>
        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📁</div>
        <p>No documents uploaded yet.</p>
      </div>
    ) : (
      documents.map((d) => (
        <div key={d.id} style={s.historyRow}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{d.name}</div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', marginTop: '2px' }}>
              Type: {d.type} • Uploaded {new Date(d.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      ))
    )}
  </div>
);

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
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '24px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  formLabel: { fontSize: '0.8rem', fontWeight: '500', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' },
  formInput: { padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '0.9rem', outline: 'none' },
  formHint: { fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' },
  cancelBtn: { padding: '10px 18px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', cursor: 'pointer' },
  saveBtn: { padding: '10px 20px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(59,130,246,0.25)' },
  paymentSummary: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0', },
  paymentItem: { padding: '24px', borderRight: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  paymentLabel: { fontSize: '0.75rem', fontWeight: '600', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' },
  paymentValue: { fontSize: '1.5rem', fontWeight: '700', marginBottom: '4px' },
  paymentSub: { fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' },
  historyRow: { display: 'flex', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  emptyTab: { padding: '48px', textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' },
  chargeBtn: { padding: '8px 16px', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 8px rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', gap: '4px' },
  cloverBadge: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', background: 'rgba(16,185,129,0.05)', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' },
  cloverDot: { color: '#10b981', fontSize: '0.6rem' },
};

export default ClientProfile;
