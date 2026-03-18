import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('portal_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Try the server-side API route first (works on Vercel)
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      // If we get HTML back (Vite dev server fallback), use direct Supabase auth
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return await directLogin(email, password);
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      const userData = { id: data.id, email: data.email, name: data.name, role: data.role };
      setUser(userData);
      localStorage.setItem('portal_user', JSON.stringify(userData));
      return { success: true };
    } catch (err) {
      // Network error or Vite serving HTML — fall back to direct Supabase
      if (err.message === 'Login failed' || err.message === 'Invalid credentials') {
        return { success: false, error: err.message };
      }
      return await directLogin(email, password);
    }
  };

  // Fallback: query Supabase directly (for local dev without Vercel serverless functions)
  const directLogin = async (email, password) => {
    try {
      const { default: bcrypt } = await import('bcryptjs');
      const { data: member, error } = await supabase
        .from('team_members')
        .select('id, email, password_hash, name, role')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (error || !member) {
        return { success: false, error: 'Invalid credentials' };
      }

      const match = await bcrypt.compare(password, member.password_hash);
      if (!match) {
        return { success: false, error: 'Invalid credentials' };
      }

      const userData = { id: member.id, email: member.email, name: member.name, role: member.role };
      setUser(userData);
      localStorage.setItem('portal_user', JSON.stringify(userData));
      return { success: true };
    } catch (err) {
      console.error('Direct login error:', err);
      return { success: false, error: 'Login failed: ' + err.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('portal_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
