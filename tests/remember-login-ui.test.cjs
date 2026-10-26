const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const vm=require('node:vm');
const esbuild=require('esbuild');
function ui(auth={}){
 const state=[],calls=[];let cursor=0;const exports={};
 const built=esbuild.buildSync({entryPoints:[path.resolve(__dirname,'../src/pages/portal/PortalLogin.jsx')],bundle:true,platform:'node',format:'cjs',packages:'external',external:['../../context/AuthContext','../../components/BrandLogo'],write:false,jsx:'automatic'});
 const context={module:{exports},exports,require(name){
 if(name==='react')return{useState(initial){const i=cursor++;if(!(i in state))state[i]=initial;return[state[i],v=>{state[i]=v;}];}};
 if(name==='react/jsx-runtime')return{jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})};
 if(name==='react-router-dom')return{Link:'link',Navigate:'redirect',useNavigate:()=>to=>calls.push({to})};
 if(name==='../../context/AuthContext')return{useAuth:()=>({loading:false,isAuthenticated:false,login:async(...args)=>{calls.push({args});return{success:true};},...auth})};
 if(name==='../../components/BrandLogo')return{default:'logo'};
 throw new Error(name);
 }};
 vm.runInNewContext(built.outputFiles[0].text,context);return{calls,render(){cursor=0;return context.module.exports.default();}};
}
function walk(x){if(!x||typeof x!=='object')return[];if(Array.isArray(x))return x.flatMap(walk);return[x,...walk(x.props?.children)];}
test('restored sign-in opens dashboard without showing another login form',()=>{const tree=ui({isAuthenticated:true}).render();assert.equal(tree.type,'redirect');assert.equal(tree.props.to,'/admin');assert.equal(tree.props.replace,true);});
test('login waits for session restoration',()=>{const tree=ui({loading:true}).render();assert.equal(walk(tree).some(x=>x.type==='form'),false);assert.equal(walk(tree).some(x=>x.props?.role==='status'),true);});
test('trusted-device checkbox explicitly passes remember choice with login',async()=>{
 const h=ui();let tree=h.render();const fields=walk(tree);const check=fields.find(x=>x.props?.name==='rememberDevice');assert.equal(check.props.checked,false);
 fields.find(x=>x.props?.id==='login-email').props.onChange({target:{value:'fictional@example.invalid'}});
 fields.find(x=>x.props?.id==='login-password').props.onChange({target:{value:'fictional-local-password'}});
 check.props.onChange({target:{checked:true}});tree=h.render();assert.equal(walk(tree).find(x=>x.props?.name==='rememberDevice').props.checked,true);
 await walk(tree).find(x=>x.type==='form').props.onSubmit({preventDefault(){}});
 assert.deepEqual(Array.from(h.calls[0].args),['fictional@example.invalid','fictional-local-password',true]);assert.equal(h.calls[1].to,'/admin');
});
