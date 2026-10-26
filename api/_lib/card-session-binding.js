import{createHash}from'node:crypto';
import{portalSessionCookieName}from'./portal-session.js';
export const digestCardValue=value=>createHash('sha256').update(value).digest('hex');
export function staffSessionBinding(req){const token=String(req?.headers?.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(portalSessionCookieName(req)+'='))?.split('=').slice(1).join('=');if(!token||token.length>2000)throw new Error('Current staff session is required.');return digestCardValue(token);}
