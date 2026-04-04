import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase, portalFetch } from '../../lib/supabase';
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

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.first_name || !form.last_name) return alert('First and last name are required');
    setSaving(true);
    const { data, error } = await supabase.from('clients').insert({
      ...form,
      status: 'active',
    }).select().single();

    if (error) {
      alert('Error: ' + error.message);
      setSaving(false);
      return;
    }

    // Push to GoHighLevel CRM in the background
    try {
      await portalFetch('/api/clients/push-to-ghl', {
        method: 'POST',
        body: JSON.stringify({ clientId: data.id }),
      });
    } catch (err) {
      console.warn('GHL sync skipped:', err.message);
    }

    navigate(`${base}/clients/${data.id}`);
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
    <div style={isAdmin ? { ...s.page, minHeight: 'auto', background: 'transparent' } : s.page}>
      {!isAdmin && (
        <header style={s.header}>
          <div style={s.headerLeft}>
            <div style={s.logoMark}>HRS</div>
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

        <form onSubmit={handleSubmit} style={s.card}>
          {fields.map((row, i) => (
            <div key={i} style={{ ...s.formRow, gridTemplateColumns: row.length === 3 ? '1fr 1fr 1fr' : row.length === 1 ? '1fr' : '1fr 1fr' }}>
              {row.map((f) => (
                <div key={f.key} style={s.formGroup}>
                  <label style={s.formLabel}>{f.label}{f.required && ' *'}</label>
                  <input
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
              <label style={s.formLabel}>Notes</label>
              <textarea
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
  formGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  formLabel: { fontSize: '0.8rem', fontWeight: '500', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' },
  formInput: { padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' },
  formActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' },
  cancelBtn: { padding: '10px 18px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', cursor: 'pointer' },
  saveBtn: { padding: '10px 24px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(59,130,246,0.25)' },
};

export default AddClient;
