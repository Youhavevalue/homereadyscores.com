import { supabase } from '../../lib/supabase';

/** Open help desk tickets count (badge). Returns 0 if table missing. */
export async function fetchOpenTicketCount() {
  try {
    const { count, error } = await supabase
      .from('help_tickets')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open');
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export async function fetchHelpTickets({ status = 'all', limit = 100 } = {}) {
  let q = supabase
    .from('help_tickets')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (status === 'open') q = q.eq('status', 'open');
  else if (status === 'closed') q = q.eq('status', 'closed');
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function createHelpTicket({ subject, body, createdById }) {
  const ticket_number = `HD-${Date.now().toString(36).toUpperCase()}`;
  const { data, error } = await supabase
    .from('help_tickets')
    .insert({
      ticket_number,
      subject,
      body: body || '',
      status: 'open',
      created_by: createdById || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTicketStatus(id, status) {
  const { error } = await supabase
    .from('help_tickets')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function fetchClientNotes(clientId, noteType) {
  let q = supabase
    .from('client_notes')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });
  if (noteType) q = q.eq('note_type', noteType);
  const { data, error } = await q;
  if (error) return [];
  return data || [];
}

export async function insertClientNote({
  clientId,
  noteType,
  receivedText,
  actionText,
  counselorName,
}) {
  const { data, error } = await supabase
    .from('client_notes')
    .insert({
      client_id: clientId,
      note_type: noteType,
      received_text: receivedText || null,
      action_text: actionText || null,
      counselor_name: counselorName || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchStaffHotLinks() {
  const { data, error } = await supabase
    .from('staff_hot_links')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) return [];
  return data || [];
}

export async function insertStaffHotLink(label) {
  const { data, error } = await supabase
    .from('staff_hot_links')
    .insert({ label: label.trim(), sort_order: 999 })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteStaffHotLink(id) {
  const { error } = await supabase.from('staff_hot_links').delete().eq('id', id);
  if (error) throw error;
}

/** Seed default custom hot links once when table is empty. */
export async function ensureDefaultStaffHotLinks(defaultLabels) {
  const { count, error } = await supabase
    .from('staff_hot_links')
    .select('*', { count: 'exact', head: true });
  if (error || (count ?? 0) > 0) return false;
  const rows = defaultLabels.map((label, i) => ({ label, sort_order: i }));
  const { error: insErr } = await supabase.from('staff_hot_links').insert(rows);
  return !insErr;
}

export async function fetchProspects() {
  const { data, error } = await supabase
    .from('prospects')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return [];
  return data || [];
}

export async function insertProspect(row) {
  const { data, error } = await supabase.from('prospects').insert(row).select().single();
  if (error) throw error;
  return data;
}
