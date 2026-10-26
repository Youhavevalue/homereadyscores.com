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
  },fetch:async(url,init)=>{if(url.includes('action=capability'))return {ok:true,json:async()=>response.capability||{enabled:false}};calls.push({url,body:JSON.parse(init.body)});if(response.throw)throw new Error('MOCK_NETWORK');return {ok:response.ok,json:async()=>response.data};}};
  const built=esbuild.buildSync({entryPoints:[path.resolve(__dirname,'../..',rel)],bundle:true,define:{'import.meta.env':'{}'},platform:'node',format:'cjs',packages:'external',external:['../lib/supabase'],write:false,jsx:'automatic'});
  vm.runInNewContext(built.outputFiles[0].text,context,{filename:rel,timeout:1000});
  return {calls,effects,render(){cursor=0;refCursor=0;return context.module.exports.default({client:{first_name:'Fictional'},onClose(){},...props});}};
}
function walk(x){if(!x||typeof x!=='object')return [];if(Array.isArray(x))return x.flatMap(walk);return [x,...walk(x.props?.children)];}
function text(x){if(Array.isArray(x))return x.map(text).join('');if(x===null||x===undefined||typeof x==='boolean')return '';return typeof x==='object'?text(x.props?.children):String(x);}
function click(h,label){const n=walk(h.render()).find(x=>x.type==='button'&&text(x)===label);assert.ok(n,`Button ${label}`);return n.props.onClick();}
function fill(h,name,value){const n=walk(h.render()).find(x=>x.type==='input'&&x.props.name===name);assert.ok(n,`Input ${name}`);n.props.onChange({target:{name,value}});}
function ready(h){for(const [k,v]of Object.entries({firstName:'Fictional',lastName:'Dryrun',email:'dryrun@example.invalid',phone:'5125550100'}))fill(h,k,v);click(h,'Next Step');click(h,'Buy a Home');const p=walk(h.render()).find(n=>n.type==='button'&&text(n).includes('Single Enrollment'));assert.ok(p);p.props.onClick();fill(h,'billingZip','00000');const c=walk(h.render()).find(n=>n.type==='input'&&n.props.id==='creditReportAgreement');c.props.onChange({target:{checked:true}});}

function readyCardPreview(h){
  for(const [k,v]of Object.entries({firstName:'Fictional',lastName:'Dryrun',email:'dryrun@example.invalid',phone:'5125550100'}))fill(h,k,v);
  click(h,'Next Step');click(h,'Buy a Home');
  walk(h.render()).find(n=>n.type==='button'&&text(n).includes('Single Enrollment')).props.onClick();
  walk(h.render()).find(n=>n.type==='input'&&n.props.id==='creditReportAgreement').props.onChange({target:{checked:true}});
}

module.exports={ui,walk,text,click,fill,readyCardPreview};
