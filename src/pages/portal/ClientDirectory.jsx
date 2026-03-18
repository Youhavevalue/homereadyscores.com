import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const ClientDirectory = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadClients();
    if (searchParams.get('sync') === 'true') syncFromGHL();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('clients')
      .select('*, payments(*)')
      .order('created_at', { ascending: false });
    if (!error) setClients(data || []);
    setLoading(false);
  };

  const syncFromGHL = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/clients/sync-ghl', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        await loadClients();
        alert(`Synced ${data.synced || 0} clients from GoHighLevel!`);
      } else {
        alert('Sync error: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Sync failed: ' + err.message);
    }
    setSyncing(false);
  };

  const filteredClients = clients.filter((c) => {
    const q = search.toLowerCase();
    return (
      (c.first_name || '').toLowerCase().includes(q) ||
      (c.last_name || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.phone || '').includes(q)
    );
  });

  const getPaymentStatus = (client) => {
    const p = client.payments?.[0];
    if (!p) return { text: 'No Payment', color: '#6b7280', bg: 'rgba(107,114,128,0.1)' };
    if (p.monthly_status === 'active') return { text: 'Active', color: '#10b981', bg: 'rgba(16,185,129,0.1)' };
    if (p.setup_fee_status === 'paid') return { text: 'Setup Paid', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' };
    if (p.setup_fee_status === 'pending') return { text: 'Pending', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' };
    return { text: p.monthly_status || 'Unknown', color: '#6b7280', bg: 'rgba(107,114,128,0.1)' };
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logoMark}>HRS</div>
          <span style={styles.headerTitle}>Client Portal</span>
        </div>
        <nav style={styles.nav}>
          <button style={styles.navBtn} onClick={() => navigate('/portal')}>Dashboard</button>
          <button style={{ ...styles.navBtn, background: 'rgba(255,255,255,0.08)', color: '#fff' }} onClick={() => navigate('/portal/clients')}>Clients</button>
        </nav>
        <div style={styles.headerRight}>
          <span style={styles.userName}>{user?.name || user?.email}</span>
          <button style={styles.logoutBtn} onClick={() => { logout(); navigate('/portal/login'); }}>Sign Out</button>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.topRow}>
          <div>
            <h1 style={styles.pageTitle}>Client Directory</h1>
            <p style={styles.pageSubtitle}>{clients.length} total clients</p>
          </div>
          <div style={styles.actions}>
            <button
              style={styles.syncBtn}
              onClick={syncFromGHL}
              disabled={syncing}
            >
              {syncing ? '⟳ Syncing...' : '↻ Sync GHL'}
            </button>
            <button style={styles.addBtn} onClick={() => navigate('/portal/clients/new')}>
              + Add Client
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={styles.searchBox}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            id="client-search"
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {/* Client Table */}
        <div style={styles.tableContainer}>
          {loading ? (
            <div style={styles.loadingBox}>Loading clients...</div>
          ) : filteredClients.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>👥</div>
              <h3 style={{ margin: '0 0 8px', fontWeight: '600' }}>
                {search ? 'No clients found' : 'No clients yet'}
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', margin: '0 0 20px' }}>
                {search ? 'Try a different search term.' : 'Add your first client or sync from GoHighLevel.'}
              </p>
            </div>
          ) : (
            <>
              <div style={styles.tableHead}>
                <div style={{ ...styles.th, flex: 2 }}>Client</div>
                <div style={{ ...styles.th, flex: 1.5 }}>Contact</div>
                <div style={{ ...styles.th, flex: 1 }}>Payment</div>
                <div style={{ ...styles.th, flex: 1 }}>Status</div>
                <div style={{ ...styles.th, flex: 0.5 }}></div>
              </div>
              {filteredClients.map((c) => {
                const ps = getPaymentStatus(c);
                return (
                  <div
                    key={c.id}
                    style={styles.tableRow}
                    onClick={() => navigate(`/portal/clients/${c.id}`)}
                  >
                    <div style={{ ...styles.td, flex: 2, display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={styles.avatar}>
                        {(c.first_name?.[0] || '?').toUpperCase()}{(c.last_name?.[0] || '').toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{c.first_name} {c.last_name}</div>
                        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', marginTop: '2px' }}>
                          Added {new Date(c.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div style={{ ...styles.td, flex: 1.5 }}>
                      <div style={{ fontSize: '0.85rem' }}>{c.email || '—'}</div>
                      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', marginTop: '2px' }}>{c.phone || '—'}</div>
                    </div>
                    <div style={{ ...styles.td, flex: 1 }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        background: ps.bg,
                        color: ps.color,
                      }}>
                        {ps.text}
                      </span>
                    </div>
                    <div style={{ ...styles.td, flex: 1 }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        background: c.status === 'active' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                        color: c.status === 'active' ? '#10b981' : '#f59e0b',
                        textTransform: 'capitalize',
                      }}>
                        {c.status || 'active'}
                      </span>
                    </div>
                    <div style={{ ...styles.td, flex: 0.5, textAlign: 'right' }}>
                      <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '1.2rem' }}>›</span>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

const styles = {
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
  main: { maxWidth: '1200px', margin: '0 auto', padding: '32px' },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  pageTitle: { fontSize: '1.75rem', fontWeight: '700', margin: '0 0 4px', letterSpacing: '-0.02em' },
  pageSubtitle: { fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', margin: 0 },
  actions: { display: 'flex', gap: '10px' },
  syncBtn: { padding: '10px 18px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', fontWeight: '500', cursor: 'pointer' },
  addBtn: { padding: '10px 20px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(59,130,246,0.25)' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '10px', padding: '0 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', marginBottom: '20px' },
  searchInput: { flex: 1, padding: '14px 0', background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '0.9rem' },
  tableContainer: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' },
  tableHead: { display: 'flex', padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' },
  th: { fontSize: '0.75rem', fontWeight: '600', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' },
  tableRow: { display: 'flex', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'background 0.15s ease' },
  td: {},
  avatar: { width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '700', flexShrink: 0 },
  loadingBox: { padding: '60px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' },
  emptyState: { padding: '60px', textAlign: 'center' },
};

export default ClientDirectory;
