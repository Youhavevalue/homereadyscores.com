import BrandLogo from '../../components/BrandLogo';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, Navigate, useNavigate } from 'react-router-dom';

const PortalLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberDevice, setRememberDevice] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, loading: sessionLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password, rememberDevice);
    setLoading(false);
    if (result.success) {
      navigate('/admin');
    } else {
      setError(result.error);
    }
  };

  if (sessionLoading) return <div style={styles.container}><p role="status" style={{ color: '#cbd5e1' }}>Checking your sign-in...</p></div>;
  if (isAuthenticated) return <Navigate to="/admin" replace />;

  return (
    <div style={styles.container}>
      <div style={styles.backdrop} />
      <div style={styles.card}>
        <div style={styles.logoSection}>
          <BrandLogo width={220} style={{ margin: '0 auto 20px' }} />
          <h1 className="sr-only">Home Ready Scores</h1>
          <p style={styles.subtitle}>Staff workspace</p>
          <h2 style={styles.heading}>Welcome back</h2>
          <p style={styles.description}>Sign in to manage enrollments and see how your website is performing.</p>
        </div>

        {error && (
          <div role="alert" style={styles.errorBox}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label htmlFor="login-email" style={styles.label}>Email Address</label>
            <input
              id="login-email"
              autoComplete="username"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your work email"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label htmlFor="login-password" style={styles.label}>Password</label>
            <input
              id="login-password"
              autoComplete="current-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
              required
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, color: '#52617a', fontSize: '0.8rem', cursor: 'pointer' }}>
            <input type="checkbox" name="rememberDevice" checked={rememberDevice} onChange={e => setRememberDevice(e.target.checked)} style={{ marginTop: 3, accentColor: '#6366f1' }} />
            <span>Keep me signed in for 30 days<br /><small style={{ color: '#657187' }}>Use only on your own device. Signing out ends access.</small></span>
          </label>

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? (
              <span style={styles.spinner} />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <details style={styles.help}>
          <summary>Which account do I use?</summary>
          <p>Use your HomeReady staff account and website password. Your email inbox and Supabase sign-in have separate passwords. Check your saved passwords for homereadyscores.com.</p>
        </details>
        <p style={styles.footerText}>Private access for your team.<br /><Link to="/" style={{ color: '#526d9a', display: 'inline-block', marginTop: 12 }}>← Return to HomeReady Scores</Link></p>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f6f8fc', position: 'relative', padding: '24px 16px', color:'#263449' },
  backdrop: { position:'absolute', inset:0, background:'radial-gradient(ellipse at 50% 0%, #eaf0ff 0%, transparent 65%)', pointerEvents:'none' },
  card: { position:'relative', width:'100%', maxWidth:440, background:'#fff', border:'1px solid #e3e9f2', borderRadius:18, padding:'clamp(24px, 6vw, 40px)', boxShadow:'0 12px 48px rgba(33,55,97,.045)' },
  logoSection: { textAlign:'center', marginBottom:30 },
  subtitle: { fontSize:10, color:'#657187', margin:'24px 0 10px', textTransform:'uppercase', letterSpacing:'.14em', fontWeight:600 },
  heading: { fontSize:27, lineHeight:1.3, color:'#233149', fontWeight:650, letterSpacing:'-.035em', margin:'0 0 10px' },
  description: { fontSize:13, lineHeight:1.8, color:'#657187', margin:0 },
  errorBox: { display:'flex', alignItems:'center', gap:8, padding:'12px 14px', background:'#fff5f4', border:'1px solid #f5d5d0', borderRadius:9, color:'#a44237', fontSize:13, marginBottom:20 },
  form: { display:'flex', flexDirection:'column', gap:20 },
  inputGroup: { display:'flex', flexDirection:'column', gap:7 },
  label: { fontSize:12, fontWeight:550, color:'#52617a' },
  input: { padding:'12px 14px', minHeight:46, width:'100%', boxSizing:'border-box', background:'#fff', border:'1px solid #dce3ee', borderRadius:8, color:'#263449', fontSize:16, transition:'border-color .15s' },
  button: { padding:14, minHeight:48, background:'#2562ff', border:0, borderRadius:8, color:'#fff', fontSize:14, fontWeight:600, marginTop:4, display:'flex', alignItems:'center', justifyContent:'center', gap:8 },
  spinner: { width:20, height:20, border:'2px solid rgba(255,255,255,.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin .6s linear infinite' },
  help: { marginTop:24, paddingTop:20, borderTop:'1px solid #edf0f5', fontSize:12, color:'#657187', lineHeight:1.8, cursor:'pointer' },
  footerText: { textAlign:'center', fontSize:11, color:'#657187', margin:'24px 0 0', lineHeight:1.8 },
};
export default PortalLogin;
