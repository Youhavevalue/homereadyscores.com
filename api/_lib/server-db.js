import { createClient } from '@supabase/supabase-js';

export function serverDb() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Server database configuration unavailable');
  return createClient(url, key, { db: { schema: 'home_ready' }, auth: { persistSession: false, autoRefreshToken: false } });
}
