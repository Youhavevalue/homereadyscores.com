// Server-only key source. Errors contain field names, never values or parsed payloads.
const PROJECT_ORIGIN='https://jshgeegriiyxaylijbhg.supabase.co';
const ID=/^[A-Za-z0-9_-]{1,64}$/;
const invalid=()=>new Error('Production card configuration is unavailable or invalid.');
function key(value){if(typeof value!=='string'||!/^[A-Za-z0-9+/]{43}=$/.test(value))throw invalid();const bytes=Buffer.from(value,'base64');if(bytes.length!==32||bytes.toString('base64')!==value||new Set(bytes).size<16)throw invalid();return bytes;}
function ring(raw,active){if(typeof raw!=='string'||raw.length>4096||!ID.test(active||''))throw invalid();let parsed;try{parsed=JSON.parse(raw);}catch{throw invalid();}if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw invalid();const entries=Object.entries(parsed);if(entries.length<1||entries.length>8||entries.some(([id,value])=>!ID.test(id)||['__proto__','constructor','prototype'].includes(id)||typeof value!=='string'))throw invalid();let tokens;try{tokens=[...raw.matchAll(/"(?:\\.|[^"\\])*"/g)].map(match=>JSON.parse(match[0]));}catch{throw invalid();}if(tokens.length!==entries.length*2||new Set(tokens.filter((_,index)=>index%2===0)).size!==entries.length)throw invalid();const keys=new Map(entries.map(([id,value])=>[id,key(value)]));if(!keys.has(active))throw invalid();return{keys,resolve:async id=>{const selected=id||active;if(!keys.has(selected))throw invalid();return{keyId:selected,key:keys.get(selected)};}};}
export function loadProductionCardKeys(env=process.env){
 let url;try{url=new URL(env.VITE_SUPABASE_URL);}catch{throw invalid();}
 if(url.origin!==PROJECT_ORIGIN||url.pathname!=='/'||url.search||url.hash||url.username||url.password||typeof env.SUPABASE_SERVICE_ROLE_KEY!=='string'||env.SUPABASE_SERVICE_ROLE_KEY.length<32)throw invalid();
 const card=ring(env.HRS_CARD_VAULT_KEYS,env.HRS_CARD_VAULT_ACTIVE_KEY_ID),fingerprint=key(env.HRS_CARD_FINGERPRINT_KEY);
 const all=[...card.keys.values(),fingerprint],distinct=new Set(all.map(value=>value.toString('hex')));if(distinct.size!==all.length)throw invalid();
 return{cardKeyResolver:card.resolve,fingerprintKeyResolver:async()=>fingerprint,hasCardKey:id=>card.keys.has(id)};
}
