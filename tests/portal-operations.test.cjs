const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const esbuild = require('esbuild');
const bcrypt = require('bcryptjs');
const crypto = require('node:crypto');

const member = { id:'11111111-1111-4111-8111-111111111111', email:'operator@example.invalid', name:'Fictional operator', role:'admin', password_hash:bcrypt.hashSync('fictional-local-password', 4) };
const request = { id:'22222222-2222-4222-8222-222222222222',first_name:'Fictional',last_name:'Request',email:'inquiry@example.invalid',phone:'5125550100',plan:'single',goal:'Buy a Home',status:'pending_manual_review',enrollment_source:'website_manual',setup_fee_status:'not_collected',subscription_status:'not_created',created_at:'2026-01-01T00:00:00.000Z',updated_at:'2026-01-01T00:00:00.000Z' };

function harness(options={}) {
  const tables={team_members:[{...member}],enrollments:[{...request}],clients:[],activity_log:[]};
  const writes=[],configs=[],reads=[];
  const db={async rpc(name,args){if(name==='review_website_inquiry'){if(options.dbFail)return {data:null,error:{message:'PRIVATE_DATABASE_DETAIL'}};if(options.reviewError)return {data:null,error:{code:options.reviewError,message:'PRIVATE_DATABASE_DETAIL'}};const row=tables.enrollments.find(r=>r.id===args.p_id&&r.enrollment_source==='website_manual'&&r.updated_at===args.p_revision);if(!row)return{data:null,error:{code:'40001'}};const payload={...args.p_review,updated_at:new Date(Math.max(Date.now(),Date.parse(row.updated_at)+1)).toISOString()};Object.assign(row,payload);writes.push({table:'enrollments',operation:'rpc',payload});return{data:{id:row.id,status:row.status,updated_at:row.updated_at},error:null};}return options.dbFail?{data:null,error:{message:'PRIVATE_DATABASE_DETAIL'}}:{data:{allowed:true,retry_after_seconds:0},error:null};},from(table){
    let filters=[],orders=[],operation='select',payload,selected=false,limit=100,offset=0,head=false,fields;
    const query={select(f,opts={}){fields=f;head=opts.head===true;selected=true;return query;},eq(k,v){filters.push(x=>x[k]===v);return query;},neq(k,v){filters.push(x=>x[k]!=null&&x[k]!==v);return query;},order(k,opts={}){orders.push([k,opts]);return query;},limit(n){limit=n;return query;},range(a,b){offset=a;limit=b-a+1;return query;},is(k,v){filters.push(x=>v===null?x[k]==null:x[k]===v);return query;},gt(k,v){filters.push(x=>x[k]!=null&&x[k]>v);return query;},lte(k,v){filters.push(x=>x[k]!=null&&x[k]<=v);return query;},or(expr){const clauses=expr.split(',').map(c=>{const [k,op,...value]=c.split('.');return [k,op,value.join('.')];});filters.push(x=>clauses.some(([k,op,v])=>op==='is'?v==='null'&&x[k]==null:op==='neq'?x[k]!=null&&x[k]!==v:String(x[k]||'').toLowerCase().includes(v.replace(/^%|%$/g,'').toLowerCase())));return query;},insert(value){operation='insert';payload=value;return query;},update(value){operation='update';payload=value;return query;},delete(){operation='delete';return query;},async single(){const r=await execute();return {...r,data:r.data?.[0]??null};},async maybeSingle(){return query.single();},then(resolve,reject){return execute().then(resolve,reject);}};
    async function execute(){
      if(operation==='select')reads.push({table,head,fields,orders});
      if(options.dbFail||options.failTable===table)return {data:null,error:{message:'PRIVATE_DATABASE_DETAIL'}};
      const rows=tables[table]||[];let matching=rows.filter(x=>filters.every(f=>f(x)));
      if(operation==='insert'){const row={id:crypto.randomUUID(),...payload};rows.push(row);tables[table]=rows;matching=[row];writes.push({table,operation,payload});}
      if(operation==='update'){matching.forEach(x=>Object.assign(x,payload));writes.push({table,operation,payload});}
      if(operation==='delete'){tables[table]=rows.filter(x=>!matching.includes(x));writes.push({table,operation});}
      matching.sort((a,b)=>{for(const[k,{ascending=true,nullsFirst=false}]of orders){if(a[k]===b[k])continue;if(a[k]==null)return nullsFirst?-1:1;if(b[k]==null)return nullsFirst?1:-1;return (a[k]<b[k]?-1:1)*(ascending?1:-1);}return 0;});
      return {data:head?null:matching.slice(offset,offset+limit).map(x=>({...x})),error:null,count:matching.length};
    }
    return query;
  }};
  const env={VITE_SUPABASE_URL:'http://local.invalid',SUPABASE_SERVICE_ROLE_KEY:'fictional-server-only-signing-material',...options.env};
  function load(rel){
    const output={};const context={exports:output,module:{exports:output},process:{env},Buffer,URL,Date:class extends Date { static now(){return Date.now()+(options.clockOffsetMs||0);} },console:{error(){},warn(){}},require(name){if(name==='@supabase/supabase-js')return {createClient:(u,k,c)=>{configs.push(c);return db;}};if(name==='bcryptjs')return bcrypt;if(name==='node:net')return require('node:net');if(name==='crypto'||name==='node:crypto')return crypto;throw new Error('Blocked import '+name);},fetch:async()=>{throw new Error('External HTTP forbidden');}};
    const built=esbuild.buildSync({entryPoints:[path.resolve(__dirname,'..',rel)],bundle:true,platform:'node',format:'cjs',packages:'external',write:false});
    vm.runInNewContext(built.outputFiles[0].text,context,{timeout:1000});return context.module.exports.default;
  }
  async function call(rel,{method='GET',body,headers={},query={}}={}){
    const response={statusCode:200,body:null,headers:{},status(code){this.statusCode=code;return this;},json(data){this.body=data;return this;},setHeader(k,v){this.headers[k.toLowerCase()]=v;return this;}};
    try{await load(rel)({method,body,socket:{remoteAddress:'127.0.0.1'},headers:{host:'localhost:4179',origin:'http://localhost:4179','content-type':'application/json',...headers},query},response);}catch(e){response.statusCode=500;response.body={uncaught:e.message};}
    return response;
  }
  async function login(){const r=await call('api/auth/login.js',{method:'POST',body:{email:member.email,password:'fictional-local-password'}});assert.equal(r.statusCode,200);const cookie=r.headers['set-cookie'];assert.ok(cookie,'server login must set session cookie');return {response:r,cookie:(Array.isArray(cookie)?cookie[0]:cookie).split(';')[0]};}
  return {call,login,tables,writes,configs,env,reads};
}

test('server login scopes HRS data and creates an HttpOnly session without password material',async()=>{
  const h=harness();const {response:r}=await h.login();assert.equal(h.configs[0].db.schema,'home_ready');assert.match(String(r.headers['set-cookie']),/HttpOnly/);assert.match(String(r.headers['set-cookie']),/SameSite=Strict/);assert.equal('password_hash' in r.body,false);assert.equal(JSON.stringify(r.body).includes('fictional-server'),false);
});
test('wrong password and malformed login fail without a session',async()=>{const h=harness();for(const body of [{email:member.email,password:'wrong'},null,{email:[],password:{}}]){const r=await h.call('api/auth/login.js',{method:'POST',body});assert.ok([400,401].includes(r.statusCode));assert.equal(r.headers['set-cookie'],undefined);}});
test('public account setup is disabled during launch',async()=>{const h=harness();const r=await h.call('api/auth/setup.js',{method:'POST',body:{email:'new@example.invalid',password:'anything',name:'Fake'}});assert.equal(r.statusCode,423);assert.equal(h.writes.length,0);});
test('forged identity header cannot read the request queue',async()=>{const h=harness();const r=await h.call('api/enrollments.js',{headers:{'x-portal-user-id':member.id}});assert.equal(r.statusCode,401);});
test('valid session restores current identity and reads only manual requests',async()=>{const h=harness();const {cookie}=await h.login();h.tables.enrollments.push({...request,id:'33333333-3333-4333-8333-333333333333',enrollment_source:'legacy'});const s=await h.call('api/auth/session.js',{headers:{cookie}});assert.equal(s.statusCode,200);const r=await h.call('api/enrollments.js',{headers:{cookie}});assert.equal(r.statusCode,200);assert.equal(r.body.requests.length,1);assert.equal(r.headers['cache-control'],'no-store');});
test('tampered, demoted, deleted and password-changed sessions fail closed',async()=>{for(const kind of ['tamper','demote','delete','password']){const h=harness();let {cookie}=await h.login();if(kind==='tamper')cookie+='x';if(kind==='demote')h.tables.team_members[0].role='viewer';if(kind==='delete')h.tables.team_members=[];if(kind==='password')h.tables.team_members[0].password_hash=bcrypt.hashSync('changed',4);const r=await h.call('api/enrollments.js',{headers:{cookie}});assert.ok([401,403].includes(r.statusCode),kind);}});
test('request review persists next action with concurrency protection and no billing writes',async()=>{const h=harness();const {cookie}=await h.login();const body={id:request.id,expectedUpdatedAt:request.updated_at,status:'contact_scheduled',assignedTo:'Fictional operator',nextAction:'Review inquiry with permitted contact channel',nextActionAt:'2026-11-01T10:00:00.000Z',reviewNotes:'Fictional test only'};const r=await h.call('api/enrollments.js',{method:'PATCH',headers:{cookie},body});assert.equal(r.statusCode,200);assert.equal(h.tables.enrollments[0].next_action,body.nextAction);assert.equal(h.tables.enrollments[0].status,'contact_scheduled');assert.equal(h.tables.enrollments[0].setup_fee_status,'not_collected');const stale=await h.call('api/enrollments.js',{method:'PATCH',headers:{cookie},body});assert.equal(stale.statusCode,409);assert.ok(h.writes.every(w=>w.table==='enrollments'));assert.equal('monthly_amount' in h.writes[0].payload,false);});
test('cross-origin, activation and invalid follow-up changes are rejected',async()=>{const h=harness();const {cookie}=await h.login();const body={id:request.id,expectedUpdatedAt:request.updated_at,status:'active'};const r=await h.call('api/enrollments.js',{method:'PATCH',headers:{cookie},body});assert.equal(r.statusCode,400);const cross=await h.call('api/enrollments.js',{method:'PATCH',headers:{cookie,origin:'https://foreign.invalid'},body});assert.equal(cross.statusCode,403);assert.equal(h.writes.length,0);});
test('database failures remain errors and leak no private details',async()=>{const h=harness();const {cookie}=await h.login();h.tables.team_members=[];const r=await h.call('api/auth/session.js',{headers:{cookie}});assert.equal(r.statusCode,401);const failed=harness({dbFail:true});const login=await failed.call('api/auth/login.js',{method:'POST',body:{email:member.email,password:'fictional-local-password'}});assert.equal(login.statusCode,503);assert.equal(JSON.stringify(login.body).includes('PRIVATE_DATABASE_DETAIL'),false);});
test('legacy staff data is server-authenticated and rejects account tables or unsafe selectors',async()=>{const h=harness();const spec={table:'clients',operation:'select',columns:'*',filters:[],orders:[],limit:100};const denied=await h.call('api/operations.js',{method:'POST',body:spec});assert.equal(denied.statusCode,401);const {cookie}=await h.login();h.tables.clients.push({id:request.id,first_name:'Fictional',status:'active'});const r=await h.call('api/operations.js',{method:'POST',headers:{cookie},body:spec});assert.equal(r.statusCode,200);assert.equal(r.body.data.length,1);for(const bad of [{...spec,table:'team_members'},{...spec,table:'public.clients'},{...spec,columns:'*,team_members(*)'}]){const x=await h.call('api/operations.js',{method:'POST',headers:{cookie},body:bad});assert.equal(x.statusCode,400);}});
test('staff updates require a record scope; billing and malformed client creation remain blocked',async()=>{const h=harness();const {cookie}=await h.login();for(const body of [{table:'clients',operation:'update',payload:{status:'closed'},filters:[]},{table:'clients',operation:'insert',payload:{}},{table:'payments',operation:'update',payload:{monthly_amount:1},filters:[{op:'eq',column:'id',value:request.id}]}]){const r=await h.call('api/operations.js',{method:'POST',headers:{cookie},body});assert.ok([400,423].includes(r.statusCode));}assert.equal(h.writes.length,0);});
test('unknown credentials are rejected and an authenticated database outage is visible',async()=>{const opts={dbFail:false};const h=harness(opts);const unknown=await h.call('api/auth/login.js',{method:'POST',body:{email:'unknown@example.invalid',password:'wrong'}});assert.equal(unknown.statusCode,401);const {cookie}=await h.login();opts.dbFail=true;const r=await h.call('api/auth/session.js',{headers:{cookie}});assert.equal(r.statusCode,503);});
test('legacy contact and outbound automation cannot create side effects',async()=>{for(const route of ['api/contact.js','api/clients/push-to-ghl.js','api/clients/sync-ghl.js']){const h=harness();const r=await h.call(route,{method:'POST',body:{clientId:request.id,firstName:'Fictional',email:'fake@example.invalid'}});assert.equal(r.statusCode,423,route);assert.equal(h.writes.length,0,route);}});

module.exports={harness};

test('staff client creation is pending-only and internal operational records persist',async()=>{const h=harness();const {cookie}=await h.login();const post=body=>h.call('api/operations.js',{method:'POST',headers:{cookie},body});const c=await post({table:'clients',operation:'insert',payload:{first_name:'Fictional',email:'fake@example.invalid',status:'active'}});assert.equal(c.statusCode,200);assert.equal(c.body.data[0].status,'pending');for(const [table,payload] of [['prospects',{first_name:'Fictional',status:'new'}],['help_tickets',{ticket_number:'HD-FAKE',subject:'Fictional ticket',status:'open'}],['client_notes',{client_id:request.id,note_type:'notes',action_text:'Fictional internal note'}],['staff_hot_links',{label:'Fictional internal label',sort_order:0}]]){const r=await post({table,operation:'insert',payload});assert.equal(r.statusCode,200,table);assert.equal(h.tables[table].length,1);}assert.ok(h.writes.every(w=>!['payments','team_members'].includes(w.table)));});
test('zero-row saves fail and only scoped custom labels may be deleted',async()=>{const h=harness();const {cookie}=await h.login();const post=body=>h.call('api/operations.js',{method:'POST',headers:{cookie},body});const scope=[{op:'eq',column:'id',value:request.id}];const stale=await post({table:'clients',operation:'update',payload:{notes:'Fictional'},filters:scope,single:'maybeSingle'});assert.equal(stale.statusCode,409);h.tables.staff_hot_links=[{id:request.id,label:'Fictional'}];const bad=await post({table:'clients',operation:'delete',filters:scope});assert.equal(bad.statusCode,423);const good=await post({table:'staff_hot_links',operation:'delete',filters:scope});assert.equal(good.statusCode,200);assert.equal(h.tables.staff_hot_links.length,0);const repeat=await post({table:'staff_hot_links',operation:'delete',filters:scope});assert.equal(repeat.statusCode,409);});
test('unauthenticated document DELETE and pending-client activation cannot mutate records',async()=>{const h=harness();const doc=await h.call('api/documents/delete-document.js',{method:'DELETE',body:{documentId:request.id}});assert.equal(doc.statusCode,401);const {cookie}=await h.login();h.tables.clients=[{id:request.id,status:'pending'}];const r=await h.call('api/operations.js',{method:'POST',headers:{cookie},body:{table:'clients',operation:'update',payload:{status:'active'},filters:[{op:'eq',column:'id',value:request.id}]}});assert.equal(r.statusCode,423);assert.equal(h.tables.clients[0].status,'pending');assert.equal(h.writes.length,0);});

test('document upload and list require a server-authenticated session',async()=>{for(const [route,method]of [['api/documents/upload-url.js','POST'],['api/documents/list.js','GET'],['api/documents/download-url.js','POST'],['api/documents/complete.js','POST']]){const h=harness();const r=await h.call(route,{method,body:{clientId:request.id}});assert.equal(r.statusCode,401,route);assert.equal(h.writes.length,0);}});

test('request queue reaches older pages and finds a saved reference without changing workflow scope',async()=>{const h=harness();const {cookie}=await h.login();for(let n=0;n<60;n++)h.tables.enrollments.push({...request,id:`33333333-3333-4333-8333-${String(n).padStart(12,'0')}`});const one=await h.call('api/enrollments.js',{headers:{cookie},query:{page:'1'}}),two=await h.call('api/enrollments.js',{headers:{cookie},query:{page:'2'}});assert.equal(one.body.total,61);assert.equal(one.body.requests.length,50);assert.equal(two.body.requests.length,11);assert.equal(new Set([...one.body.requests,...two.body.requests].map(r=>r.id)).size,61);const exact=await h.call('api/enrollments.js',{headers:{cookie},query:{search:request.id}});assert.equal(exact.body.total,1);assert.equal(exact.body.requests[0].id,request.id);});
test('request queue rejects unsafe search/filter/page values before database query',async()=>{const h=harness();const {cookie}=await h.login();for(const query of [{page:'0'},{page:['1','2']},{search:'x),status.eq.active'},{status:'active'},{action:'invented'}]){const r=await h.call('api/enrollments.js',{headers:{cookie},query});assert.equal(r.statusCode,400);}});

test('nonretryable PT409 review conflicts return409 without writes or private details',async()=>{const h=harness({reviewError:'PT409'});const {cookie}=await h.login();const body={id:request.id,expectedUpdatedAt:request.updated_at,status:'closed',assignedTo:'Ashley',nextAction:'Fictional test only',nextActionAt:'2026-11-01T10:00:00Z',reviewNotes:'Unsaved fictional draft'};const r=await h.call('api/enrollments.js',{method:'PATCH',headers:{cookie},body});assert.equal(r.statusCode,409);assert.match(r.body.error,/changed/);assert.equal(h.writes.length,0);assert.equal(h.tables.enrollments[0].updated_at,request.updated_at);assert.equal(JSON.stringify(r.body).includes('PRIVATE_DATABASE_DETAIL'),false);});

// Whole-queue follow-up visibility regressions.
const since='2026-10-01T00:00:00.000Z';
function seed(h){const base={...h.tables.enrollments[0]};h.tables.enrollments=[];const add=(id,patch)=>h.tables.enrollments.push({...base,id:'44444444-4444-4444-8444-'+String(id).padStart(12,'0'),assigned_to:'Ashley',next_action_at:null,...patch});
 add(1,{created_at:'2026-01-01T00:00:00.000Z'});
 add(2,{created_at:'2026-10-10T00:00:00.000Z',next_action_at:'2026-01-02T00:00:00.000Z'});
 add(3,{created_at:'2026-10-11T00:00:00.000Z',next_action_at:'2099-01-01T00:00:00.000Z'});
 add(4,{created_at:'2026-10-12T00:00:00.000Z',status:'closed'});
 add(5,{created_at:'2026-10-13T00:00:00.000Z',enrollment_source:'legacy'});
 add(6,{created_at:'2026-01-03T00:00:00.000Z',status:null});
 for(let n=7;n<67;n++)add(n,{status:'closed',created_at:'2026-10-14T00:00:00.000Z'});
}
test('attention counts cover all open website requests beyond the visible page without returning personal rows',async()=>{const h=harness();const{cookie}=await h.login();seed(h);const before=JSON.stringify(h.tables);const r=await h.call('api/enrollments.js',{headers:{cookie},query:{overview:'1',since}});assert.equal(r.statusCode,200);assert.deepEqual(JSON.parse(JSON.stringify(r.body.counts)),{open:4,unscheduled:2,overdue:1,newSince:2});assert.equal(r.body.since,since);assert.ok(Number.isFinite(Date.parse(r.body.checkedAt)));assert.equal(r.body.consistency,'separate_reads');assert.equal('requests'in r.body,false);assert.doesNotMatch(JSON.stringify(r.body),/example.invalid|Fictional|5125550100/);assert.ok(h.reads.filter(q=>q.table==='enrollments').every(q=>q.head&&q.fields==='id'));assert.equal(h.writes.length,0);assert.equal(JSON.stringify(h.tables),before);assert.equal(r.headers['cache-control'],'no-store');});
test('open priority queue puts oldest unscheduled work before overdue and future work, excluding closed records',async()=>{const h=harness();const{cookie}=await h.login();seed(h);const r=await h.call('api/enrollments.js',{headers:{cookie},query:{status:'open'}});assert.equal(r.statusCode,200);assert.deepEqual(r.body.requests.map(x=>x.id.slice(-2)),['01','06','02','03']);assert.ok(Number.isFinite(Date.parse(r.body.readStartedAt)));});
test('overview failures never become zero counts and reveal no private error',async()=>{const options={};const h=harness(options);const{cookie}=await h.login();options.failTable='enrollments';const r=await h.call('api/enrollments.js',{headers:{cookie},query:{overview:'1',since}});assert.equal(r.statusCode,503);assert.equal(r.body.counts,undefined);assert.doesNotMatch(JSON.stringify(r.body),/PRIVATE_DATABASE_DETAIL/);});
test('overview is admin-only and rejects malformed/future windows and mixed selectors',async()=>{const h=harness();const unauth=await h.call('api/enrollments.js',{query:{overview:'1',since}});assert.equal(unauth.statusCode,401);const{cookie}=await h.login();for(const query of [{overview:['1','1'],since},{overview:'yes',since},{overview:'1',since:'2099-01-01T00:00:00.000Z'},{overview:'1',since:'yesterday'},{overview:'1',since:[since]},{overview:'1',since,page:'2'}]){const before=h.reads.length;const r=await h.call('api/enrollments.js',{headers:{cookie},query});assert.equal(r.statusCode,400,JSON.stringify(query));assert.equal(h.reads.slice(before).filter(q=>q.table==='enrollments').length,0);}assert.equal(h.writes.length,0);});
test('dedicated arrivals filter reaches every new open inquiry even behind50 old unscheduled rows',async()=>{const h=harness();const{cookie}=await h.login();const base={...h.tables.enrollments[0]};h.tables.enrollments=[];for(let n=0;n<60;n++)h.tables.enrollments.push({...base,id:'74444444-4444-4444-8444-'+String(n).padStart(12,'0'),next_action_at:null,created_at:n<55?'2026-01-01T00:00:00.000Z':'2026-10-10T00:00:00.000Z'});const r=await h.call('api/enrollments.js',{headers:{cookie},query:{status:'open',receivedAfter:since}});assert.equal(r.statusCode,200);assert.equal(r.body.total,5);assert.equal(r.body.requests.length,5);assert.ok(r.body.requests.every(row=>row.created_at>since));for(const receivedAfter of ['tomorrow',['2026-01-01T00:00:00.000Z'],'2099-01-01T00:00:00.000Z'])assert.equal((await h.call('api/enrollments.js',{headers:{cookie},query:{receivedAfter}})).statusCode,400);});

// The clock belongs to the local harness; these never use production credentials.
test('remembered login lasts 30 days, restores identity, and remains revocable',async()=>{
  for(const rememberDevice of [undefined,false,true,'true']){
    const h=harness();const r=await h.call('api/auth/login.js',{method:'POST',body:{email:member.email,password:'fictional-local-password',rememberDevice}});
    assert.equal(r.statusCode,200);
    const cookie=r.headers['set-cookie'].split(';')[0];
    const ttl=rememberDevice===true?30*24*60*60:4*60*60;
    assert.match(r.headers['set-cookie'],new RegExp('Max-Age='+ttl+'(?:;|$)'));
    const payload=JSON.parse(Buffer.from(cookie.split('=')[1].split('.')[0],'base64url'));
    assert.equal(payload.exp-payload.iat,ttl);
    assert.equal((await h.call('api/auth/session.js',{headers:{cookie}})).statusCode,200);
    h.tables.team_members[0].password_hash=bcrypt.hashSync('changed',4);
    assert.equal((await h.call('api/auth/session.js',{headers:{cookie}})).statusCode,401);
  }
});
test('remembered sessions keep secure cookies, role checks, tamper protection and sign-out',async()=>{
  for(const kind of ['tamper','demote','delete','logout']){
    const h=harness();const headers={origin:'https://localhost:4179','x-forwarded-proto':'https'};
    const r=await h.call('api/auth/login.js',{method:'POST',headers,body:{email:member.email,password:'fictional-local-password',rememberDevice:true}});
    assert.equal(r.statusCode,200);assert.match(r.headers['set-cookie'],/^__Host-hrs_session=/);assert.match(r.headers['set-cookie'],/; Secure/);assert.match(r.headers['set-cookie'],/HttpOnly; SameSite=Strict/);
    let cookie=r.headers['set-cookie'].split(';')[0];
    if(kind==='logout'){const out=await h.call('api/auth/logout.js',{method:'POST',headers:{...headers,cookie}});assert.equal(out.statusCode,200);assert.match(out.headers['set-cookie'],/Max-Age=0/);continue;}
    if(kind==='tamper')cookie+='x';if(kind==='demote')h.tables.team_members[0].role='viewer';if(kind==='delete')h.tables.team_members=[];
    assert.ok([401,403].includes((await h.call('api/auth/session.js',{headers:{...headers,cookie}})).statusCode));
  }
});

test('remembered sessions survive four hours but expire after 30 days; ordinary sessions expire at four hours',async()=>{
  for(const rememberDevice of [false,true]){
    const options={};const h=harness(options);
    const r=await h.call('api/auth/login.js',{method:'POST',body:{email:member.email,password:'fictional-local-password',rememberDevice}});
    const cookie=r.headers['set-cookie'].split(';')[0];
    options.clockOffsetMs=5*60*60*1000;
    assert.equal((await h.call('api/auth/session.js',{headers:{cookie}})).statusCode,rememberDevice?200:401);
    options.clockOffsetMs=30*24*60*60*1000+1000;
    assert.equal((await h.call('api/auth/session.js',{headers:{cookie}})).statusCode,401);
  }
});
