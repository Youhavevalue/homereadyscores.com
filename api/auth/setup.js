import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, name, adminSecret } = req.body;

  // Simple secret to prevent unauthorized account creation
  if (adminSecret !== (process.env.ADMIN_SETUP_SECRET || 'setup-hrs-2024')) {
    return res.status(403).json({ error: 'Invalid setup secret' });
  }

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' });
  }

  try {
    const hash = await bcrypt.hash(password, 12);

    const { data, error } = await supabase
      .from('team_members')
      .insert({
        email: email.toLowerCase().trim(),
        password_hash: hash,
        name,
        role: 'admin',
      })
      .select('id, email, name, role')
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'User with this email already exists' });
      }
      throw error;
    }

    return res.status(201).json({ success: true, user: data });
  } catch (err) {
    console.error('Setup error:', err);
    return res.status(500).json({ error: 'Failed to create user' });
  }
}
