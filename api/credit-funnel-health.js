import { serverDb } from './_lib/server-db.js';
// Public deployment wiring check. Never returns credentials, rows, errors or URLs.
export async function handleFunnelHealth(req,res,getDb=serverDb) {
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  let projectRef=null;
  try { const url=new URL(process.env.VITE_SUPABASE_URL||'');const match=url.hostname.match(/^([a-z0-9]{20})\.supabase\.co$/);if(url.protocol==='https:'&&match)projectRef=match[1]; } catch { /* Missing configuration is reported below. */ }
  const configured=!!projectRef&&!!process.env.SUPABASE_SERVICE_ROLE_KEY;
  let ready=false;
  if(configured)try {
    // A fixed nonexistent session tests function presence, table access and service grants.
    // Only the expected not-found result establishes readiness; no data is returned.
    const {error}=await getDb().rpc('credit_funnel_dispatch',{p_action:'get',p_token:'0'.repeat(64),p_payload:{}});
    ready=error?.code==='PT404';
  }catch { /* Operational failures stay private. */ }
  return res.status(ready?200:503).json({configured,projectRef,schema:'home_ready',ready});
}
export default handleFunnelHealth;
