const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const esbuild = require('esbuild');

const root = path.resolve(__dirname, '..');
const valid = {firstName:' Fictional ',lastName:' Dryrun ',email:'DRYRUN@EXAMPLE.INVALID ',phone:'(512) 555-0100',goal:'Buy a Home',plan:'single',billingZip:'00000',creditReportAgreement:true};

function load(rel, options={}) {
  const writes=[], network=[], clients=[];
  const db = {
    async rpc(name,args) {
      writes.push({rpc:name,payload:args.p_request,key:args.p_key});
      if(options.rateLimited)return {data:{allowed:false,retry_after_seconds:3600},error:null};
      if(options.changedRetry)return {data:null,error:{code:'22023'}};
      if(options.throwDb)throw new Error('MOCK_PRIVATE_ERROR');
      return {data:options.emptyResult?null:{allowed:true,request_id:'MOCK_REQUEST_ID',replayed:false},error:options.dbError?{message:'MOCK_PRIVATE_ERROR'}:null};
    },
    from(table) {
      return {
        insert(payload) {
          writes.push({table,payload});
          return {
            select() {
              return {
                async single() {
                  if(options.throwDb)throw new Error('MOCK_PRIVATE_ERROR');
                  return {data:options.emptyResult?null:{id:'MOCK_REQUEST_ID'},error:options.dbError?{message:'MOCK_PRIVATE_ERROR'}:null};
                }
              };
            }
          };
        }
      };
    }
  };
  const exports={};
  const context={exports,module:{exports},Buffer,URL,process:{env:{SUPABASE_SERVICE_ROLE_KEY:'fictional-not-live',VITE_SUPABASE_URL:'https://fictional.supabase.invalid'}},console:{error(){},warn(){}},require(name){
    if(name==='@supabase/supabase-js')return {createClient:(url,key,config)=>{clients.push(config);return db;}};
    if(name==='crypto'||name==='node:crypto')return require('node:crypto');
    if(name==='node:net')return require('node:net');
    // The composed production runtime imports the existing password verifier.
    if(name==='bcryptjs')return require('bcryptjs');
    throw new Error(`Import blocked: ${name}`);
  },fetch:async(url)=>{network.push(url);throw new Error('External HTTP blocked by test');}};
  const built=esbuild.buildSync({entryPoints:[path.join(root,rel)],bundle:true,platform:'node',format:'cjs',packages:'external',write:false});
  vm.runInNewContext(built.outputFiles[0].text,context,{filename:rel,timeout:1000});
  return {writes,network,clients,async request(body=valid,method='POST'){
    const res={setHeader(){},statusCode:200,body:null,status(code){this.statusCode=code;return this;},json(value){this.body=value;return this;}};
    try{await context.module.exports.default({method,body,headers:{host:'localhost',origin:'http://localhost','content-type':'application/json'},socket:{remoteAddress:'127.0.0.1'}},res);}catch(e){res.statusCode=500;res.body={uncaught:e.message};}
    return res;
  }};
}

test('manual request is persisted pending without payment, subscription or GHL calls',async()=>{
  const h=load('api/enroll.js');const r=await h.request();
  assert.equal(r.statusCode,201);assert.equal(r.body.status,'pending_manual_review');assert.equal(r.body.billingMode,'manual');assert.equal(r.body.requestId,'MOCK_REQUEST_ID');
  assert.equal(h.network.length,0);assert.equal(h.writes.length,1);assert.equal(h.writes[0].rpc,'submit_website_inquiry');
  const p=h.writes[0].payload;assert.equal(p.credit_report_agreement,true);
  assert.equal(p.email,'dryrun@example.invalid');assert.equal(p.phone,'5125550100');assert.equal(p.first_name,'Fictional');assert.equal(p.plan,'single');
  assert.equal(h.clients[0].db.schema,'home_ready');assert.equal('source' in p,false);assert.equal('clover_subscription_id' in p,false);
});
test('couple request passes the plan to atomic persistence without charging',async()=>{const h=load('api/enroll.js');const r=await h.request({...valid,plan:'couple'});assert.equal(r.statusCode,201);assert.equal(h.writes[0].payload.plan,'couple');assert.equal(h.network.length,0);});
test('client billing-mode override cannot enable automated enrollment',async()=>{const h=load('api/enroll.js');const r=await h.request({...valid,billingMode:'automatic',automatedBillingEnabled:true});assert.equal(r.statusCode,201);assert.equal(r.body.billingMode,'manual');assert.equal(h.network.length,0);});
test('old card-token payload is rejected before any side effect',async()=>{const h=load('api/enroll.js');const r=await h.request({...valid,source:'MOCK_TOKEN_NO_CARD'});assert.equal(r.statusCode,400);assert.equal(h.writes.length,0);assert.equal(h.network.length,0);});
for(const [name,patch] of [['blank name',{firstName:' '}],['invalid email',{email:'invalid'}],['invalid phone',{phone:'1111111111'}],['unknown plan',{plan:'other'}],['array plan',{plan:['single']}],['object plan',{plan:{name:'single'}}],['missing agreement',{creditReportAgreement:false}],['string agreement',{creditReportAgreement:'true'}],['oversized name',{firstName:'x'.repeat(101)}]]){
  test(`manual enrollment rejects ${name} before persistence`,async()=>{const h=load('api/enroll.js');const r=await h.request({...valid,...patch});assert.equal(r.statusCode,400);assert.equal(h.writes.length,0);assert.equal(h.network.length,0);});
}
test('null request body is a validation error',async()=>{const h=load('api/enroll.js');const r=await h.request(null);assert.equal(r.statusCode,400);assert.equal(h.writes.length,0);});
for(const [name,options] of [['database error',{dbError:true}],['empty database result',{emptyResult:true}],['database exception',{throwDb:true}]]){
  test(`manual enrollment reports ${name} without false success or private details`,async()=>{const h=load('api/enroll.js',options);const r=await h.request();assert.equal(r.statusCode,503);assert.notEqual(r.body.success,true);assert.equal(JSON.stringify(r.body).includes('MOCK_PRIVATE_ERROR'),false);assert.equal(h.network.length,0);});
}
test('enrollment retains method protection',async()=>{const h=load('api/enroll.js');const r=await h.request(valid,'GET');assert.equal(r.statusCode,405);assert.equal(h.writes.length,0);});
for(const route of ['charge','create-customer','create-plan','create-subscription','process-payment']){
  test(`${route} rejects direct billing requests during manual launch`,async()=>{const h=load(`api/clover/${route}.js`);const r=await h.request({...valid,amount:18499,source:'MOCK_TOKEN_NO_CARD',customerId:'MOCK_CUSTOMER',planId:'MOCK_PLAN',clientId:'MOCK_CLIENT',name:'Single'});assert.equal(r.statusCode,423);assert.equal(r.body.code,'AUTOMATED_BILLING_DISABLED');assert.equal(h.network.length,0);assert.equal(h.writes.length,0);});
  test(`${route} retains method protection`,async()=>{const h=load(`api/clover/${route}.js`);const r=await h.request({},'GET');assert.equal(r.statusCode,405);assert.equal(h.network.length,0);});
}
test('configuration advertises manual mode without returning tokenization configuration',async()=>{const h=load('api/clover/config.js');const r=await h.request({},'GET');assert.equal(r.statusCode,200);assert.equal(r.body.billingMode,'manual');assert.equal(r.body.automatedBillingEnabled,false);assert.equal('sdkUrl' in r.body,false);assert.equal('apiAccessKey' in r.body,false);});

test('signed-out same-origin enrollment retains its submission key and pending response',async()=>{
 const h=load('api/enroll.js');const key='12345678-1234-4234-8234-123456789abc';
 const r=await h.request({...valid,submissionKey:key,sessionId:key});
 assert.equal(r.statusCode,201);assert.equal(r.body.status,'pending_manual_review');
 assert.equal(h.writes[0].key,key);assert.equal(h.network.length,0);
});
test('rate-limited signup returns retryable failure without a success receipt',async()=>{
 const h=load('api/enroll.js',{rateLimited:true}),r=await h.request();
 assert.equal(r.statusCode,429);assert.notEqual(r.body.success,true);assert.equal(h.network.length,0);
});
test('changed retry returns conflict instead of claiming a saved enrollment',async()=>{
 const h=load('api/enroll.js',{changedRetry:true}),r=await h.request();
 assert.equal(r.statusCode,409);assert.notEqual(r.body.success,true);assert.equal(h.network.length,0);
});
