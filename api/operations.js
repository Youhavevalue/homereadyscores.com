import { requireAdmin, sameOrigin } from './_lib/portal-session.js';
import { serverDb } from './_lib/server-db.js';
import { READ_COLUMNS, WRITE_COLUMNS } from './_lib/operations-schema.js';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export default async function handler(req,res) {
  if (req.method !== 'POST') return res.status(405).json({error:'Method not allowed'});
  if (!sameOrigin(req)) return res.status(403).json({error:'Use the team portal for this operation.'});
  if(!String(req.headers['content-type']||'').toLowerCase().startsWith('application/json'))return res.status(415).json({error:'JSON request required.'});
  const member=await requireAdmin(req,res);if(!member)return;
  const b=req.body;
  if (!b || typeof b!=='object' || Array.isArray(b) || typeof b.table!=='string' || !Object.hasOwn(READ_COLUMNS,b.table) || !['select','insert','update','delete'].includes(b.operation) || JSON.stringify(b).length>100000) return res.status(400).json({error:'Unsupported staff operation.'});
  const allowed=READ_COLUMNS[b.table];
  const columns=b.columns==='*'||b.columns===undefined?allowed:String(b.columns).split(',');
  if (!columns.length || columns.some(c=>!allowed.includes(c))) return res.status(400).json({error:'Unsupported staff fields.'});
  const filters=b.filters??[],orders=b.orders??[];
  if (!Array.isArray(filters)||filters.length>8||filters.some(f=>!f||!['eq','neq'].includes(f.op)||!allowed.includes(f.column)||!['string','number','boolean'].includes(typeof f.value)||String(f.value).length>1000)||!Array.isArray(orders)||orders.length>3||orders.some(o=>!o||!allowed.includes(o.column))) return res.status(400).json({error:'Unsupported staff filter.'});
  if(b.operation==='delete'&&b.table!=='staff_hot_links')return res.status(423).json({error:'Deletion is unavailable for this record type.'});
  if(b.operation!=='select'){
    if(!Object.hasOwn(WRITE_COLUMNS,b.table)||(b.operation==='insert'&&!['clients','dispute_letters','intake_forms','client_notes','help_tickets','staff_hot_links','prospects'].includes(b.table))) return res.status(423).json({error:'This operation is deferred for the manual-request release.'});
    if(b.operation!=='delete'&&(!b.payload||typeof b.payload!=='object'||Array.isArray(b.payload)||Object.keys(b.payload).some(k=>!WRITE_COLUMNS[b.table].includes(k))))return res.status(400).json({error:'Unsupported update fields.'});
    if(['update','delete'].includes(b.operation)&&!filters.some(f=>f.op==='eq'&&f.column==='id'&&UUID.test(f.value)))return res.status(400).json({error:'A specific record is required.'});
    if(b.operation==='insert'&&['dispute_letters','intake_forms','client_notes'].includes(b.table)&&!UUID.test(b.payload.client_id||''))return res.status(400).json({error:'A valid client is required.'});
  }
  if(b.table==='clients'&&b.operation==='update'&&b.payload.status==='active')return res.status(423).json({error:'Service activation is paused pending the current approved agreement and procedure.'});
  if(b.operation!=='select'&&b.operation!=='delete'){
    for(const [key,value] of Object.entries(b.payload)){if(value!==null&&typeof value==='string'&&value.length>20000)return res.status(400).json({error:'Staff field is too long.'});if(value!==null&&typeof value==='object'&&!(b.table==='intake_forms'&&key==='form_data'))return res.status(400).json({error:'Unsupported staff field value.'});}
    if(b.operation==='insert'&&['clients','prospects'].includes(b.table)&&(!b.payload.first_name||typeof b.payload.first_name!=='string'||b.payload.first_name.trim().length>100))return res.status(400).json({error:'A first name is required.'});
    if(b.table==='help_tickets'&&b.payload.status&&!['open','closed'].includes(b.payload.status))return res.status(400).json({error:'Invalid ticket status.'});
    if(b.operation==='insert'&&b.table==='clients')b.payload={...b.payload,status:'pending'};
    if(b.operation==='update'&&['clients','help_tickets','prospects','dispute_letters','intake_forms'].includes(b.table))b.payload={...b.payload,updated_at:new Date(Math.max(Date.now(), ...filters.filter(f=>f.op==='eq'&&f.column==='updated_at'&&Number.isFinite(Date.parse(f.value))).map(f=>Date.parse(f.value)+1))).toISOString()};
  }
  try{
    let q=serverDb().from(b.table);
    if(b.operation==='insert')q=q.insert(b.payload);
    if(b.operation==='update')q=q.update(b.payload);
    if(b.operation==='delete')q=q.delete();
    q=q.select(columns.join(','),{...(b.count==='exact'?{count:'exact'}:{}),...(b.head===true?{head:true}:{})});
    for(const f of filters)q=q[f.op](f.column,f.value);
    for(const o of orders)q=q.order(o.column,{ascending:o.ascending!==false});
    q=q.limit(Number.isInteger(b.limit)?Math.max(1,Math.min(b.limit,200)):200);
    if(b.single==='single')q=q.single();else if(b.single==='maybeSingle')q=q.maybeSingle();
    const {data,error,count}=await q;
    if(error)return res.status(503).json({error:'Staff data could not be loaded or saved. Please retry.'});
    if(['update','delete'].includes(b.operation)&&(!data||(Array.isArray(data)&&!data.length)))return res.status(409).json({error:'Record changed or is unavailable. Reload before saving.'});
    return res.status(200).json({data,count:count??null,error:null});
  }catch{return res.status(503).json({error:'Staff data is temporarily unavailable. Please retry.'});}
}
