import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const PortalDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ clients: 0, activePayments: 0, pendingCharges: 0, disputes: 0 });
  const [recentClients, setRecentClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [clientsRes, paymentsRes, disputesRes, scheduledRes] = await Promise.all([
        supabase.from('clients').select('*', { count: 'exact' }),
        supabase.from('payments').select('*', { count: 'exact' }).eq('monthly_status', 'active'),
        supabase.from('dispute_letters').select('*', { count: 'exact' }).neq('status', 'completed'),
        supabase.from('scheduled_charges').select('*', { count: 'exact' }).eq('status', 'pending'),
      ]);

      setStats({
        clients: clientsRes.count || 0,
        activePayments: paymentsRes.count || 0,
        pendingCharges: scheduledRes.count || 0,
        disputes: disputesRes.count || 0,
      });

      const { data: recent } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      setRecentClients(recent || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Clients', value: stats.clients, icon: '👥', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
    { label: 'Active Subscriptions', value: stats.activePayments, icon: '💳', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Pending Charges', value: stats.pendingCharges, icon: '⏳', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { label: 'Open Disputes', value: stats.disputes, icon: '📝', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  ];

  return (
    <div style={styles.page}>
      {/* Top Bar */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logoMark}>HRS</div>
          <span style={styles.headerTitle}>Client Portal</span>
        </div>
        <nav style={styles.nav}>
          <button style={styles.navBtn} onClick={() => navigate('/portal')}>Dashboard</button>
          <button style={styles.navBtn} onClick={() => navigate('/portal/clients')}>Clients</button>
        </nav>
        <div style={styles.headerRight}>
          <span style={styles.userName}>{user?.name || user?.email}</span>
          <button style={styles.logoutBtn} onClick={() => { logout(); navigate('/portal/login'); }}>
            Sign Out
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.welcomeRow}>
          <div>
            <h1 style={styles.pageTitle}>Welcome back, {user?.name?.split(' ')[0] || 'Team'}</h1>
            <p style={styles.pageSubtitle}>Here's an overview of your client operations.</p>
          </div>
          <button
            style={styles.addClientBtn}
            onClick={() => navigate('/portal/clients/new')}
          >
            <span style={{ fontSize: '1.1rem' }}>+</span> Add Client
          </button>
        </div>

        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          {statCards.map((s, i) => (
            <div key={i} style={{ ...styles.statCard, borderColor: `${s.color}22` }}>
              <div style={{ ...styles.statIcon, background: s.bg, color: s.color }}>{s.icon}</div>
              <div>
                <div style={styles.statValue}>{loading ? '—' : s.value}</div>
                <div style={styles.statLabel}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Clients */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Recent Clients</h2>
            <button style={styles.viewAllBtn} onClick={() => navigate('/portal/clients')}>View All →</button>
          </div>

          {loading ? (
            <div style={styles.loadingBox}>Loading...</div>
          ) : recentClients.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>👥</div>
              <h3 style={styles.emptyTitle}>No clients yet</h3>
              <p style={styles.emptyText}>Add your first client or sync from GoHighLevel.</p>
              <div style={styles.emptyActions}>
                <button style={styles.addClientBtn} onClick={() => navigate('/portal/clients/new')}>
                  + Add Client
                </button>
                <button style={styles.syncBtn} onClick={() => navigate('/portal/clients?sync=true')}>
                  Sync from GHL
                </button>
              </div>
            </div>
          ) : (
            <div style={styles.clientList}>
              {recentClients.map((c) => (
                <div
                  key={c.id}
                  style={styles.clientRow}
                  onClick={() => navigate(`/portal/clients/${c.id}`)}
                >
                  <div style={styles.clientAvatar}>
                    {(c.first_name?.[0] || '?').toUpperCase()}{(c.last_name?.[0] || '').toUpperCase()}
                  </div>
                  <div style={styles.clientInfo}>
                    <div style={styles.clientName}>{c.first_name} {c.last_name}</div>
                    <div style={styles.clientEmail}>{c.email || c.phone || 'No contact info'}</div>
                  </div>
                  <div style={{
                    ...styles.statusBadge,
                    background: c.status === 'active' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                    color: c.status === 'active' ? '#10b981' : '#f59e0b',
                  }}>
                    {c.status || 'active'}
                  </div>
                  <div style={styles.chevron}>›</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0a0a1a',
    color: '#fff',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    height: '64px',
    background: 'rgba(255,255,255,0.02)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    backdropFilter: 'blur(20px)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoMark: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.7rem',
    fontWeight: '800',
    letterSpacing: '0.05em',
    color: '#fff',
  },
  headerTitle: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  nav: {
    display: 'flex',
    gap: '4px',
  },
  navBtn: {
    padding: '8px 16px',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '0.85rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  userName: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.5)',
  },
  logoutBtn: {
    padding: '6px 14px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '0.8rem',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '32px',
  },
  welcomeRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px',
  },
  pageTitle: {
    fontSize: '1.75rem',
    fontWeight: '700',
    margin: '0 0 4px',
    letterSpacing: '-0.02em',
  },
  pageSubtitle: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.4)',
    margin: 0,
  },
  addClientBtn: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    boxShadow: '0 4px 12px rgba(59,130,246,0.25)',
    transition: 'all 0.15s ease',
  },
  syncBtn: {
    padding: '10px 20px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: 'rgba(255,255,255,0.8)',
    fontSize: '0.85rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '16px',
    marginBottom: '40px',
  },
  statCard: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    transition: 'all 0.2s ease',
  },
  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.3rem',
    flexShrink: 0,
  },
  statValue: {
    fontSize: '1.75rem',
    fontWeight: '700',
    letterSpacing: '-0.02em',
  },
  statLabel: {
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '500',
    marginTop: '2px',
  },
  section: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px',
    overflow: 'hidden',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    margin: 0,
  },
  viewAllBtn: {
    background: 'none',
    border: 'none',
    color: '#3b82f6',
    fontSize: '0.85rem',
    fontWeight: '500',
    cursor: 'pointer',
  },
  loadingBox: {
    padding: '48px',
    textAlign: 'center',
    color: 'rgba(255,255,255,0.3)',
  },
  emptyState: {
    padding: '60px 40px',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    margin: '0 0 8px',
  },
  emptyText: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.4)',
    margin: '0 0 24px',
  },
  emptyActions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
  },
  clientList: {
    // no extra styles needed
  },
  clientRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 24px',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    cursor: 'pointer',
    transition: 'background 0.15s ease',
  },
  clientAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8rem',
    fontWeight: '700',
    flexShrink: 0,
  },
  clientInfo: {
    flex: 1,
    minWidth: 0,
  },
  clientName: {
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  clientEmail: {
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.4)',
    marginTop: '2px',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  chevron: {
    fontSize: '1.2rem',
    color: 'rgba(255,255,255,0.2)',
  },
};

export default PortalDashboard;
