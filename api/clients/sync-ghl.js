// Historical implementation remains recoverable in Git e949e67.
// Fail closed before creating database/provider clients.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (["POST"].includes(req.method)) return res.status(423).json({ error: 'Outbound CRM synchronization is paused for this release.' });
  return res.status(405).json({ error: 'Method not allowed' });
}
