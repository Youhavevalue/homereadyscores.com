import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { documentId } = req.body || {};

    if (!documentId) {
      return res.status(400).json({ error: 'documentId is required' });
    }

    // Get the document record to find the file path
    const { data: doc, error: fetchError } = await supabase
      .from('documents')
      .select('file_path')
      .eq('id', documentId)
      .single();

    if (fetchError || !doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Delete from storage if file_path exists
    if (doc.file_path) {
      const { error: storageError } = await supabase.storage
        .from('client-documents')
        .remove([doc.file_path]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
        // Continue to delete DB record even if storage delete fails
      }
    }

    // Delete the database record
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (deleteError) {
      return res.status(500).json({ error: 'Failed to delete document record' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Delete document error:', err);
    return res.status(500).json({ error: err.message });
  }
}
