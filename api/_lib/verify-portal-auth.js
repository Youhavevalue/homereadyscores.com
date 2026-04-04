import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Verifies portal authentication by checking the x-portal-user-id header
 * against the team_members table. Returns the team member record or null.
 */
export async function verifyPortalAuth(req) {
  const userId = req.headers['x-portal-user-id'];
  if (!userId) return null;

  try {
    const { data: member, error } = await supabase
      .from('team_members')
      .select('id, email, name, role')
      .eq('id', userId)
      .single();

    if (error || !member) return null;
    return member;
  } catch {
    return null;
  }
}
