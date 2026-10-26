import{createProductionCardRuntime}from'./_lib/production-card-runtime.js';
export default function handler(req,res){return createProductionCardRuntime().card(req,res);}
