import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Fetch wrapper for portal API calls that includes the authenticated
 * user ID header so server-side routes can verify the caller.
 */
export function portalFetch(url, options = {}) {
  const stored = localStorage.getItem('portal_user');
  const user = stored ? JSON.parse(stored) : null;
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(user?.id ? { 'x-portal-user-id': user.id } : {}),
      ...options.headers,
    },
  });
}
