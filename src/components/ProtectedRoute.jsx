import BrandLogo from './BrandLogo';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '24px',
        background: '#0a0a1a',
        color: 'rgba(255,255,255,0.4)',
        fontFamily: "'Inter', sans-serif",
      }}>
        <BrandLogo reverse width={216} />
        <p role="status">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/portal/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
