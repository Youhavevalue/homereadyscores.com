const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const vm=require('node:vm');
const esbuild=require('esbuild');

function ui(rel='src/pages/GetStarted.jsx', response={ok:true,data:{billingMode:'manual',status:'pending_manual_review',requestId:'MOCK_REQUEST_ID'}},props={}){
  const state=[],refs=[],effects=[],calls=[];let cursor=0,refCursor=0;
  const react={useState(initial){const i=cursor++;if(!(i in state))state[i]=initial;return [state[i],v=>{state[i]=typeof v==='function'?v(state[i]):v;}];},useEffect(fn){effects.push(fn);},useRef(initial){const i=refCursor++;if(!refs[i])refs[i]={current:initial};return refs[i];}};
  const exports={};const context={module:{exports},exports,console:{error(){}},alert(){},document:{getElementById:()=>({focus(){}})},require(name){
    if(name==='react')return react;
    if(name==='react-router-dom')return {useNavigate:()=>()=>{}};
    if(name==='react/jsx-runtime')return {jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props}),Fragment:'fragment'};
    if(name==='lucide-react')return new Proxy({}, {get:(_,k)=>String(k)});
    if(name==='@supabase/supabase-js')return {createClient:()=>({})};
    if(name==='../lib/supabase')return {portalFetch:async()=>{throw new Error('Unexpected portal billing call');}};
    throw new Error(`Blocked import ${name}`);
  },fetch:async(url,init)=>{calls.push({url,body:JSON.parse(init.body)});if(response.throw)throw new Error('MOCK_NETWORK');return {ok:response.ok,json:async()=>response.data};}};
  const built=esbuild.buildSync({entryPoints:[path.resolve(__dirname,'..',rel)],bundle:true,platform:'node',format:'cjs',packages:'external',external:['../lib/supabase'],write:false,jsx:'automatic'});
  vm.runInNewContext(built.outputFiles[0].text,context,{filename:rel,timeout:1000});
  return {calls,effects,render(){cursor=0;refCursor=0;return context.module.exports.default({client:{first_name:'Fictional'},onClose(){},...props});}};
}
function walk(x){if(!x||typeof x!=='object')return [];if(Array.isArray(x))return x.flatMap(walk);return [x,...walk(x.props?.children)];}
function text(x){if(Array.isArray(x))return x.map(text).join('');if(x===null||x===undefined||typeof x==='boolean')return '';return typeof x==='object'?text(x.props?.children):String(x);}
function click(h,label){const n=walk(h.render()).find(x=>x.type==='button'&&text(x)===label);assert.ok(n,`Button ${label}`);return n.props.onClick();}
function fill(h,name,value){const n=walk(h.render()).find(x=>x.type==='input'&&x.props.name===name);assert.ok(n,`Input ${name}`);n.props.onChange({target:{name,value}});}
function ready(h){for(const [k,v]of Object.entries({firstName:'Fictional',lastName:'Dryrun',email:'dryrun@example.invalid',phone:'5125550100'}))fill(h,k,v);click(h,'Next Step');click(h,'Buy a Home');const p=walk(h.render()).find(n=>n.type==='button'&&text(n).includes('Single Enrollment'));assert.ok(p);p.props.onClick();fill(h,'billingZip','00000');const c=walk(h.render()).find(n=>n.type==='input'&&n.props.id==='creditReportAgreement');c.props.onChange({target:{checked:true}});}

test('public signup completes as a pending request without card entry or SDK effects',async()=>{const h=ui();ready(h);assert.equal(walk(h.render()).some(n=>String(n.props?.id||'').startsWith('clover-card')),false);for(const effect of h.effects)assert.doesNotMatch(String(effect),/clover|createElement|appendChild/i);await click(h,'Get Started Now');assert.equal(h.calls.length,1);assert.equal(h.calls[0].url,'/api/enroll');assert.equal('source' in h.calls[0].body,false);const copy=text(h.render());assert.match(copy,/Enrollment received/);assert.match(copy,/MOCK_REQUEST_ID/);assert.match(copy,/Your enrollment request has been received/i);assert.doesNotMatch(copy,/payment has been processed/i);});
test('public signup keeps form available on save failure',async()=>{const h=ui(undefined,{ok:false,data:{error:'Unable to save your request.'}});ready(h);await click(h,'Get Started Now');assert.match(text(h.render()),/Unable to save/);assert.ok(walk(h.render()).some(n=>n.type==='button'&&text(n)==='Get Started Now'));assert.doesNotMatch(text(h.render()),/Enrollment received/);});
test('plan cards show the requested initial and monthly prices with 30-day timing',()=>{
  const h=ui();ready(h);
  for(const [title,initial,monthly] of [['Single Enrollment','189.99','100.00'],['Couple Enrollment','379.99','160.00']]){
    const card=walk(h.render()).find(n=>n.type==='button'&&text(n).includes(title));
    assert.ok(card);assert.ok(text(card).includes(`$${initial}`));assert.ok(text(card).includes(`$${monthly}/month`));
    assert.match(text(card),/starting 30 days after signup/i);
  }
});
test('switching plans updates the initial total and monthly summary without claiming collection',()=>{
  const h=ui();ready(h);
  for(const [title,initial,monthly] of [['Single Enrollment','189.99','100.00'],['Couple Enrollment','379.99','160.00'],['Single Enrollment','189.99','100.00']]){
    const card=walk(h.render()).find(n=>n.type==='button'&&text(n).includes(title));card.props.onClick();
    const summary=walk(h.render()).find(n=>n.props?.['aria-label']==='Enrollment summary');assert.ok(summary);
    const copy=text(summary);assert.ok(copy.includes(`Initial total$${initial}`));assert.ok(copy.includes(`$${monthly}/mo`));
    assert.match(copy,/starting 30 days after signup/i);assert.doesNotMatch(copy,/You will not be charged/i);
    assert.doesNotMatch(copy,/\$0\.00|due today|charged today|paid/i);
  }
  assert.equal(h.calls.length,0);
});

test('public signup does not accept an old paid response as manual success',async()=>{const h=ui(undefined,{ok:true,data:{success:true,chargeId:'MOCK_OLD_CHARGE'}});ready(h);await click(h,'Get Started Now');assert.doesNotMatch(text(h.render()),/Enrollment received/);});
test('public signup handles an interrupted save without false success',async()=>{const h=ui(undefined,{throw:true});ready(h);await click(h,'Get Started Now');assert.doesNotMatch(text(h.render()),/Enrollment received/);assert.ok(walk(h.render()).some(n=>n.type==='button'&&text(n)==='Get Started Now'));});
test('portal payment component offers manual notice without card form or SDK requests',async()=>{const h=ui('src/components/CloverPaymentForm.jsx');const tree=h.render();assert.match(text(tree),/automatic.*disabled/i);assert.equal(walk(tree).some(n=>n.type==='form'),false);assert.equal(walk(tree).some(n=>String(n.props?.id||'').startsWith('clover-card')),false);for(const effect of h.effects)await effect();assert.equal(h.calls.length,0);});

function readyCardPreview(h){
  for(const [k,v]of Object.entries({firstName:'Fictional',lastName:'Dryrun',email:'dryrun@example.invalid',phone:'5125550100'}))fill(h,k,v);
  click(h,'Next Step');click(h,'Buy a Home');
  walk(h.render()).find(n=>n.type==='button'&&text(n).includes('Single Enrollment')).props.onClick();
  walk(h.render()).find(n=>n.type==='input'&&n.props.id==='creditReportAgreement').props.onChange({target:{checked:true}});
}
test('local-only card preparation uses Next and collects billing address before any enrollment save',()=>{
 const h=ui(undefined,undefined,{cardStepPreview:true});readyCardPreview(h);click(h,'Next');
 const copy=text(h.render());assert.match(copy,/Billing address/i);assert.match(copy,/card entry is unavailable/i);assert.doesNotMatch(copy,/Enrollment received/);
 for(const name of ['billingAddressLine1','billingAddressLine2','billingCity','billingState','billingZip'])assert.ok(walk(h.render()).some(n=>n.props?.name===name),name);
 assert.equal(h.calls.length,0);
 assert.equal(walk(h.render()).some(n=>/cc-number|cc-csc/.test(n.props?.autoComplete||'')),false);
});
test('card preparation blocks incomplete billing address and never treats an address as verified card',async()=>{
 const h=ui(undefined,undefined,{cardStepPreview:true});readyCardPreview(h);click(h,'Next');await click(h,'Check test details');assert.match(text(h.render()),/Enter your billing street address/i);
 for(const [k,v]of Object.entries({billingAddressLine1:'100 Example Way',billingCity:'Austin',billingState:'TX',billingZip:'78701'}))fill(h,k,v);
 await click(h,'Check test details');assert.match(text(h.render()),/fictional cardholder name/i);assert.doesNotMatch(text(h.render()),/card verified|Enrollment received/i);assert.equal(h.calls.length,0);
});
test('local card preparation preserves billing draft and plan when returning to plan review',()=>{
 const h=ui(undefined,undefined,{cardStepPreview:true});readyCardPreview(h);click(h,'Next');fill(h,'billingAddressLine1','100 Example Way');fill(h,'billingAddressLine2','Unit 2');click(h,'Back');
 assert.match(text(h.render()),/Single Enrollment/);click(h,'Next');assert.equal(walk(h.render()).find(n=>n.props?.name==='billingAddressLine2').props.value,'Unit 2');assert.equal(h.calls.length,0);
});

test('test-card preview rejects malformed number and never submits after format-valid test card',async()=>{
 const h=ui(undefined,undefined,{cardStepPreview:true});readyCardPreview(h);click(h,'Next');
 for(const [k,v]of Object.entries({billingAddressLine1:'100 Example Way',billingCity:'Austin',billingState:'TX',billingZip:'78701','demoCard-name':'Fictional Example','demoCard-number':'4111111111111112','demoCard-expiry':'12/99'}))fill(h,k,v);
 await click(h,'Check test details');assert.match(text(h.render()),/Enter a valid card number\./);assert.equal(h.calls.length,0);
 fill(h,'demoCard-number','4111111111111111');await click(h,'Check test details');assert.match(text(h.render()),/No card was verified, saved, submitted or charged/);assert.doesNotMatch(text(h.render()),/Enrollment received/);assert.equal(h.calls.length,0);
 assert.equal(walk(h.render()).some(n=>/cvv|cvc/i.test(n.props?.name||'')),false);
});


test('editing a previously checked billing address clears the obsolete format-success notice',async()=>{
 const h=ui(undefined,undefined,{cardStepPreview:true});readyCardPreview(h);click(h,'Next');
 for(const [k,v]of Object.entries({billingAddressLine1:'100 Example Way',billingCity:'Austin',billingState:'TX',billingZip:'78701','demoCard-name':'Fictional Example','demoCard-number':'4111111111111111','demoCard-expiry':'12/99'}))fill(h,k,v);
 await click(h,'Check test details');assert.match(text(h.render()),/Test details pass format checks/);
 fill(h,'billingCity','');assert.doesNotMatch(text(h.render()),/Test details pass format checks/);
 await click(h,'Check test details');assert.match(text(h.render()),/Enter your billing city/);assert.doesNotMatch(text(h.render()),/Test details pass format checks/);assert.equal(h.calls.length,0);
});

test('editing a checked ZIP clears its obsolete notice and an incomplete ZIP cannot pass',async()=>{
 const h=ui(undefined,undefined,{cardStepPreview:true});readyCardPreview(h);click(h,'Next');
 for(const [k,v]of Object.entries({billingAddressLine1:'100 Example Way',billingCity:'Austin',billingState:'TX',billingZip:'78701','demoCard-name':'Fictional Example','demoCard-number':'4111111111111111','demoCard-expiry':'12/99'}))fill(h,k,v);
 await click(h,'Check test details');assert.match(text(h.render()),/Test details pass format checks/);
 fill(h,'billingZip','12');assert.doesNotMatch(text(h.render()),/Test details pass format checks/);
 await click(h,'Check test details');assert.match(text(h.render()),/five-digit billing ZIP/);assert.equal(h.calls.length,0);
});
