export default async function handler(req,res) {
  if (req.method !== 'POST') return res.status(405).json({error:'Method not allowed'});
  return res.status(423).json({error:'Public account setup is disabled. Existing authorized team accounts must be managed by the owner.'});
}
