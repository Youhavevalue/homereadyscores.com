import { serverDb } from './_lib/server-db.js';
import { handleCreditFunnel } from './_lib/credit-funnel.js';
export default async function handler(req,res){try{return await handleCreditFunnel(req,res,serverDb());}catch{return res.status(503).json({error:'Saving is temporarily unavailable. Please retry.'});}}
