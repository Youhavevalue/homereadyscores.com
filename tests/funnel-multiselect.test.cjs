const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const esbuild = require('esbuild');
const vm = require('node:vm');
const path = require('node:path');
process.env.VITE_SUPABASE_URL = 'https://synthetic.invalid';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'synthetic-test-only';
const fixture = {id:'qa-lead', firstName:'Fictional', lastName:'Visitor', email:'qa@example.invalid', phone:'5125550100', goal:'Buy a Home', concern:['collections','late_payments'], scoreRange:'unknown',status:'questionnaire_complete'};
function text(n) { if(Array.isArray(n)) return n.map(text).join(' '); if(!n || typeof n==='boolean')return ''; return typeof n==='object'?(n.props?.['aria-hidden']? '':typeof n.type==='function'?text(n.type(n.props)):text(n.props?.children)):String(n); }
function nodes(n) { if(!n || typeof n!=='object')return []; if(Array.isArray(n))return n.flatMap(nodes); if(typeof n.type==='function')return nodes(n.type(n.props)); return [n,...nodes(n.props?.children)]; }
async function ui(saved=null) {
 const state=[],effects=[],calls=[];let cursor=0,lead=saved;
 const react={useState(initial){const i=cursor++;if(!(i in state))state[i]=initial;return [state[i],v=>state[i]=typeof v==='function'?v(state[i]):v];},useRef(initial){const i=cursor++;return state[i]||=( {current:initial} );},useCallback:fn=>fn,useEffect:fn=>effects.push(fn)};
 const built=esbuild.buildSync({entryPoints:[path.resolve(__dirname,'../src/pages/CreditFunnel.jsx')],bundle:true,platform:'node',format:'cjs',jsx:'automatic',packages:'external',external:['../components/BrandLogo','../lib/funnel-client','../lib/website-tracker','./credit-funnel.css'],define:{'import.meta.env.VITE_HRS_SYNTHETIC_PREVIEW':'undefined'},write:false});
 const exports={},ctx={module:{exports},exports,navigator:{doNotTrack:'1'},crypto:{randomUUID},require(name){if(name==='react')return react;if(name==='react-router-dom')return {Link:'a',useNavigate:()=>()=>{}};if(name==='react/jsx-runtime')return {jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})};if(name.includes('BrandLogo'))return {default:()=>null};if(name.includes('website-tracker'))return {captureWebsiteContext:()=>null};if(name.endsWith('.css'))return {};if(name.includes('funnel-client'))return {async funnelRequest(action,payload){if(!action&&!lead){const e=Error('No lead');e.status=404;throw e;}if(action){calls.push({action,payload});lead={...fixture,...lead,...payload};}return {success:true,lead};}};throw Error(name);}};
 vm.runInNewContext(built.outputFiles[0].text,ctx);
 const render=()=>{cursor=0;return ctx.module.exports.default();};render();effects[0]();await new Promise(setImmediate);
 return {calls,render,all:()=>nodes(render()),button(name){const n=nodes(render()).find(n=>n.type==='button'&&text(n).replace(/\s+/g,' ').trim()===name);assert.ok(n,`button ${name}`);return n;},input(name){const n=nodes(render()).find(n=>n.type==='input'&&n.props.name===name);assert.ok(n,`input ${name}`);return n;}};
}
test('independent checkboxes keep both concerns through back/forward and submit phone with the list',async()=>{
 const page=await ui();page.button('Buy a home').props.onClick();page.button('Continue').props.onClick();
 assert.match(text(page.render()),/Which credit concerns do you have\?/);assert.match(text(page.render()),/Select all that apply/);
 let boxes=page.all().filter(n=>n.type==='input'&&n.props.type==='checkbox');assert.equal(boxes.length,6);assert.equal(page.button('Continue').props.disabled,true);
 boxes[0].props.onChange({target:{checked:true}});boxes=page.all().filter(n=>n.props.type==='checkbox');boxes[1].props.onChange({target:{checked:true}});
 assert.deepEqual(page.all().filter(n=>n.props.type==='checkbox').map(n=>n.props.checked),[true,true,false,false,false,false]);
 page.button('Continue').props.onClick();page.button('Back').props.onClick();assert.equal(page.all().filter(n=>n.props.type==='checkbox'&&n.props.checked).length,2);
 boxes=page.all().filter(n=>n.props.type==='checkbox');boxes[0].props.onChange({target:{checked:false}});assert.equal(page.all().filter(n=>n.props.type==='checkbox'&&n.props.checked).length,1);
 page.all().filter(n=>n.props.type==='checkbox')[0].props.onChange({target:{checked:true}});
 page.button('Continue').props.onClick();await page.button('Continue').props.onClick();
 for(const [name,value] of Object.entries({firstName:'Fictional',lastName:'Visitor',email:'qa@example.invalid',phone:'(512) 555-0100'}))page.input(name).props.onChange({target:{value}});
 page.button('Back').props.onClick();page.button('Continue').props.onClick();page.button('Continue').props.onClick();await page.button('Continue').props.onClick();assert.equal(page.input('phone').props.value,'(512) 555-0100');
 await page.all().find(n=>n.type==='form').props.onSubmit({preventDefault(){}});
 const saved=page.calls.find(c=>c.action==='saveContact').payload;assert.deepEqual(Array.from(saved.concern),['late_payments','collections']);assert.equal(saved.phone,'(512) 555-0100');assert.match(text(page.render()),/Late payments.*Collections/);assert.match(text(page.render()),/512/);
});
test('saved lists and historical single concerns restore and can be edited',async()=>{
 for(const concern of [['collections','late_payments'],'collections']){const page=await ui({...fixture,concern});assert.match(text(page.render()),/Collections/);if(Array.isArray(concern))assert.match(text(page.render()),/Late payments/);page.button('Edit Credit concerns').props.onClick();assert.equal(page.all().filter(n=>n.props.type==='checkbox'&&n.props.checked).length,Array.isArray(concern)?2:1);}
});
function response(){return {statusCode:200,headers:{},setHeader(k,v){this.headers[k]=v;},status(n){this.statusCode=n;return this;},json(body){this.body=body;return this;}};}
async function api(concern,phone='(512) 555-0100') {
 const {handleCreditFunnel}=await import('../api/_lib/credit-funnel.js');let stored;
 const db={async rpc(name,args){assert.equal(name,'credit_funnel_dispatch');stored=args.p_payload;return {data:{id:fixture.id,details:stored,stage:'contact_saved'},error:null};}};
 const res=response();await handleCreditFunnel({method:'POST',headers:{host:'localhost:3080',origin:'http://localhost:3080','content-type':'application/json'},socket:{remoteAddress:'127.0.0.1'},body:{firstName:fixture.firstName,lastName:fixture.lastName,email:fixture.email,goal:fixture.goal,scoreRange:fixture.scoreRange,action:'saveContact',concern,phone,submissionKey:randomUUID(),sessionId:randomUUID(),attribution:{},contactConsent:true,marketingConsent:false}},res,db);return {res,stored};
}
test('server saves every allowed concern and phone, deduplicates choices and reads legacy strings',async()=>{
 const {res,stored}=await api(['collections','late_payments','collections']);assert.equal(res.statusCode,201,JSON.stringify(res.body));assert.deepEqual(stored.concern,['collections','late_payments']);assert.equal(stored.phone,'5125550100');assert.deepEqual(res.body.lead.concern,['collections','late_payments']);
 const legacy=await api('high_balances');assert.equal(legacy.res.statusCode,201);assert.deepEqual(legacy.res.body.lead.concern,['high_balances']);
});
test('server rejects empty, unknown, nested and malformed concerns and invalid phone before saving',async()=>{
 for(const concern of [[],['collections','invalid'],[['collections']],{},42,null]){const {res,stored}=await api(concern);assert.equal(res.statusCode,400);assert.equal(stored,undefined);}
 const {res,stored}=await api(['collections'],'123');assert.equal(res.statusCode,400);assert.equal(stored,undefined);
});
