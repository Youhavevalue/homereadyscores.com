// Phone/authenticator provisioning is unavailable in the password-only flow.
export default function handler(req,res){res.setHeader('Cache-Control','no-store');return res.status(410).json({enabled:false,error:'Re-enter your staff password in the saved-card form.'});}
