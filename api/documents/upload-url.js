import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { clientId, fileName, fileType, docType } = req.body;

    if (!clientId || !fileName) {
      return res.status(400).json({ error: 'clientId and fileName are required' });
    }

    // Generate a unique file path
    const timestamp = Date.now();
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${clientId}/${timestamp}_${safeName}`;

    // Create signed upload URL
    const { data, error } = await supabase.storage
      .from('client-documents')
      .createSignedUploadUrl(filePath);

    if (error) {
      console.error('Storage error:', error);
      return res.status(500).json({ error: 'Failed to create upload URL' });
    }

    return res.status(200).json({
      signedUrl: data.signedUrl,
      path: data.path,
      filePath,
      token: data.token,
    });
  } catch (err) {
    console.error('Upload URL error:', err);
    return res.status(500).json({ error: err.message });
  }
}
