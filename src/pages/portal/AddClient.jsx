import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { usePortalBase } from '../../hooks/usePortalBase';

const AddClient = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const base = usePortalBase();
  const isAdmin = pathname.startsWith('/admin');
  const { user, logout } = useAuth();
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    address: '', city: '', state: '', zip: '', notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    if (!form.first_name.trim() || !form.last_name.trim()) { setSaveError('First and last name are required.'); return; }
    setSaving(true);
    setSaveError('');
    try {
      const { data, error } = await supabase.from('clients').insert({
        ...Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim()])),
        status: 'pending',
      }).select().single();
      if (error || !data?.id) throw new Error(error?.message || 'Client could not be saved.');
      navigate(`${base}/clients/${data.id}`);
    } catch (err) { setSaveError(err.message || 'Client could not be saved. Please retry.'); }
    finally { setSaving(false); }
  };

  const fields = [
    [
      { key: 'first_name', label: 'First Name', required: true },
      { key: 'last_name', label: 'Last Name', required: true },
    ],
    [
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'phone', label: 'Phone', type: 'tel' },
    ],
    [
      { key: 'address', label: 'Address', full: true },
    ],
    [
      { key: 'city', label: 'City' },
      { key: 'state', label: 'State' },
      { key: 'zip', label: 'ZIP Code' },
    ],
  ];

  return (
    <div className="staff-add-client" style={isAdmin ? { ...s.page, minHeight: 'auto', background: 'transparent', color: '#0f172a' } : s.page}>
      {!isAdmin && (
        <header style={s.header}>
          <div style={s.headerLeft}>
            <img src="/brand/c05/logos/logo-horizontal-reverse.svg" alt="HomeReady Scores" width="180" height="55" style={{ display: 'block', width: 180, height: 'auto' }} />
            <span style={s.headerTitle}>Client Portal</span>
          </div>
          <nav style={s.nav}>
            <button style={s.navBtn} onClick={() => navigate(`${base}`)}>Dashboard</button>
            <button style={s.navBtn} onClick={() => navigate(`${base}/clients`)}>Clients</button>
          </nav>
          <div style={s.headerRight}>
            <span style={s.userName}>{user?.name || user?.email}</span>
            <button style={s.logoutBtn} onClick={() => { logout(); navigate('/portal/login'); }}>Sign Out</button>
          </div>
        </header>
      )}

      <main style={isAdmin ? { ...s.main, maxWidth: '720px', margin: 0, padding: 0 } : s.main}>
        <button style={s.backLink} onClick={() => navigate(`${base}/clients`)}>← Back to Directory</button>
        <h1 style={s.pageTitle}>Add New Client</h1>
        <p className="mb-4 text-sm text-slate-600">Creates a pending staff record for review. Agreement signing, activation, payments, and customer messaging do not occur here.</p>
        {saveError && <p role="alert" className="mb-4 rounded-lg border border-red-200 p-3 text-red-700">{saveError}</p>}

        <form className="client-create-card" onSubmit={handleSubmit} style={s.card}>
          {fields.map((row, i) => (
            <div className="client-create-row" key={i} style={{ ...s.formRow, gridTemplateColumns: row.length === 3 ? '1fr 1fr 1fr' : row.length === 1 ? '1fr' : '1fr 1fr' }}>
              {row.map((f) => (
                <div key={f.key} style={s.formGroup}>
                  <label htmlFor={"client-"+f.key} style={s.formLabel}>{f.label}{f.required && ' *'}</label>
                  <input
                    id={"client-"+f.key}
                    style={s.formInput}
                    type={f.type || 'text'}
                    value={form[f.key]}
                    onChange={handleChange(f.key)}
                    required={f.required}
                    placeholder={f.label}
                  />
                </div>
              ))}
            </div>
          ))}

          <div style={s.formRow}>
            <div style={s.formGroup}>
              <label htmlFor="client-notes" style={s.formLabel}>Notes</label>
              <textarea
                id="client-notes"
                style={{ ...s.formInput, minHeight: '80px', resize: 'vertical' }}
                value={form.notes}
                onChange={handleChange('notes')}
                placeholder="Any notes about this client..."
              />
            </div>
          </div>

          <div style={s.formActions}>
            <button type="button" style={s.cancelBtn} onClick={() => navigate(`${base}/clients`)}>Cancel</button>
            <button type="submit" style={s.saveBtn} disabled={saving}>
              {saving ? 'Saving...' : 'Add Client'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

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
  main: { maxWidth: '700px', margin: '0 auto', padding: '32px' },
  backLink: { background: 'none', border: 'none', color: '#3b82f6', fontSize: '0.85rem', cursor: 'pointer', padding: 0, marginBottom: '16px', display: 'block' },
  pageTitle: { fontSize: '1.5rem', fontWeight: '700', margin: '0 0 24px', letterSpacing: '-0.02em' },
  card: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '28px' },
  formRow: { display: 'grid', gap: '16px', marginBottom: '16px' },
  formGroup: { minWidth: 0, display: 'flex', flexDirection: 'column', gap: '6px' },
  formLabel: { fontSize: '0.8rem', fontWeight: '500', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' },
  formInput: { minWidth:0, width:'100%', boxSizing:'border-box', padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid #cbd5e1', borderRadius: '10px', color: '#0f172a', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' },
  formActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' },
  cancelBtn: { padding: '10px 18px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#475569', fontSize: '0.85rem', cursor: 'pointer' },
  saveBtn: { padding: '10px 24px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(59,130,246,0.25)' },
};

export default AddClient;
