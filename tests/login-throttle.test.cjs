const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const esbuild = require('esbuild');
const bcrypt = require('bcryptjs');
const crypto = require('node:crypto');
const net = require('node:net');

const member = { id:'11111111-1111-4111-8111-111111111111', email:'operator@example.invalid', name:'Fictional operator', role:'admin', password_hash:bcrypt.hashSync('fictional-local-password', 4) };

// External DB/RPC boundary only: the handler, hashing, IP parsing, bcrypt and session code are real.
function harness(options = {}) {
  const calls = [];
  let memberReads = 0;
  const db = {
    async rpc(name, args) {
      calls.push({ name, args });
      if (options.rpcThrow) throw new Error('PRIVATE_RPC_DETAIL');
      if (options.rpcError) return { data:null, error:{ message:'PRIVATE_RPC_DETAIL' } };
      return { data:options.result === undefined ? { allowed:true, retry_after_seconds:0 } : options.result, error:null };
    },
    from(table) {
      assert.equal(table, 'team_members');
      memberReads++;
      return { select() { return this; }, eq() { return this; }, async maybeSingle() { return { data:options.unknown ? null : member, error:null }; } };
    },
  };
  const env = { VITE_SUPABASE_URL:'http://local.invalid', SUPABASE_SERVICE_ROLE_KEY:'fictional-server-only-signing-material', ...options.env };
  function handler() {
    const output = {};
    const context = { exports:output, module:{ exports:output }, process:{ env }, Buffer, URL, Date, console:{ error() {} }, require(name) {
      if (name === '@supabase/supabase-js') return { createClient:() => db };
      if (name === 'bcryptjs') return bcrypt;
      if (name === 'node:crypto') return crypto;
      if (name === 'node:net') return net;
      throw new Error('Blocked import '+name);
    } };
    const built = esbuild.buildSync({ entryPoints:[path.resolve(__dirname,'../api/auth/login.js')], bundle:true, platform:'node', format:'cjs', packages:'external', write:false });
    vm.runInNewContext(built.outputFiles[0].text, context, { timeout:1000 });
    return context.module.exports.default;
  }
  async function login({ email=member.email, password='fictional-local-password', headers={}, ip='127.0.0.1' }={}) {
    const res = { statusCode:200, headers:{}, status(code) { this.statusCode=code;return this; }, json(body) { this.body=body;return this; }, setHeader(k,v) { this.headers[k.toLowerCase()]=v;return this; } };
    await handler()({ method:'POST', body:{ email,password }, headers:{ host:'localhost:4179', origin:`${env.VERCEL === '1' ? 'https' : 'http'}://localhost:4179`, 'content-type':'application/json', ...headers }, socket:{ remoteAddress:ip } }, res);
    return res;
  }
  return { login, calls, env, get memberReads() { return memberReads; } };
}

test('limiter outage fails closed before password lookup and does not disclose DB errors', async () => {
  for (const options of [{ rpcError:true }, { rpcThrow:true }]) {
    const h=harness(options);const r=await h.login();
    assert.equal(r.statusCode,503);assert.equal(h.memberReads,0);assert.equal(r.headers['set-cookie'],undefined);assert.doesNotMatch(JSON.stringify(r.body),/PRIVATE_RPC_DETAIL/);
  }
});
test('denied account or IP budget returns a retry delay before credential work', async () => {
  const h=harness({ result:{ allowed:false,retry_after_seconds:417 } });const r=await h.login();
  assert.equal(r.statusCode,429);assert.equal(r.headers['retry-after'],'417');assert.equal(h.memberReads,0);assert.equal(r.headers['set-cookie'],undefined);
});
test('allowed login consumes only opaque account and IP keys before issuing a session', async () => {
  const h=harness();const r=await h.login();assert.equal(r.statusCode,200);assert.equal(h.calls.length,1);
  assert.equal(h.calls[0].name,'consume_login_attempt');assert.deepEqual(Object.keys(h.calls[0].args).sort(),['p_account_key','p_ip_key']);
  for (const value of Object.values(h.calls[0].args)) assert.match(value,/^[a-f0-9]{64}$/);
  assert.notEqual(h.calls[0].args.p_account_key,h.calls[0].args.p_ip_key);assert.doesNotMatch(JSON.stringify(h.calls),/operator@example|127\.0\.0\.1|fictional-local-password|fictional-server/);assert.ok(r.headers['set-cookie']);
});
test('malformed or inconsistent limiter responses fail closed', async () => {
  for (const result of [null,[],{allowed:true},{allowed:'true',retry_after_seconds:0},{allowed:true,retry_after_seconds:2},{allowed:false,retry_after_seconds:0},{allowed:false,retry_after_seconds:901},{allowed:false,retry_after_seconds:1.5}]) {
    const h=harness({result});const r=await h.login();assert.equal(r.statusCode,503,JSON.stringify(result));assert.equal(h.memberReads,0);assert.equal(r.headers['set-cookie'],undefined);
  }
});
test('normalized accounts and equivalent IP addresses share their durable budget keys', async () => {
  const h=harness();await h.login({email:' Operator@Example.Invalid ',ip:'::ffff:127.0.0.1'});await h.login({email:'operator@example.invalid',ip:'127.0.0.1'});
  assert.equal(h.calls[0].args.p_account_key,h.calls[1].args.p_account_key);assert.equal(h.calls[0].args.p_ip_key,h.calls[1].args.p_ip_key);
  await h.login({ip:'2001:db8:1234:5678::1'});await h.login({ip:'2001:0db8:1234:5678:ffff::2'});await h.login({ip:'2001:db8:1234:5679::1'});
  assert.equal(h.calls[2].args.p_ip_key,h.calls[3].args.p_ip_key);assert.notEqual(h.calls[3].args.p_ip_key,h.calls[4].args.p_ip_key);
});
test('deployment uses the Vercel client IP and ignores spoofable forwarding alternatives', async () => {
  const h=harness({env:{VERCEL:'1'}});
  await h.login({headers:{'x-vercel-forwarded-for':'203.0.113.7','x-forwarded-for':'198.51.100.8'}});
  await h.login({headers:{'x-vercel-forwarded-for':'203.0.113.7','x-forwarded-for':'198.51.100.9'}});
  assert.equal(h.calls[0].args.p_ip_key,h.calls[1].args.p_ip_key);
  for (const headers of [{},{'x-forwarded-for':'203.0.113.7'},{'x-vercel-forwarded-for':'203.0.113.7, 198.51.100.2'},{'x-vercel-forwarded-for':'invalid'}]) {
    const r=await h.login({headers});assert.equal(r.statusCode,503);assert.equal(r.headers['set-cookie'],undefined);
  }
});
test('local forwarding headers cannot change the socket IP bucket', async () => {
  const h=harness();await h.login({headers:{'x-vercel-forwarded-for':'203.0.113.7','x-forwarded-for':'198.51.100.8'}});await h.login({headers:{'x-vercel-forwarded-for':'198.51.100.9'}});
  assert.equal(h.calls[0].args.p_ip_key,h.calls[1].args.p_ip_key);
  const r=await h.login({ip:null});assert.equal(r.statusCode,503);
  const invalid=await h.login({ip:'invalid'});assert.equal(invalid.statusCode,503);
});
test('missing signing material fails closed before the RPC and credential lookup', async () => {
  const h=harness({env:{SUPABASE_SERVICE_ROLE_KEY:''}});const r=await h.login();assert.equal(r.statusCode,503);assert.equal(h.calls.length,0);assert.equal(h.memberReads,0);
});
test('independent concurrent handler instances submit every attempt to the durable RPC boundary', async () => {
  const h=harness({unknown:true});const responses=await Promise.all(Array.from({length:12},()=>h.login({password:'wrong'})));
  assert.ok(responses.every(r=>r.statusCode===401));assert.equal(h.calls.length,12);assert.equal(new Set(h.calls.map(x=>x.args.p_account_key)).size,1);
});
test('login rejects form and missing content types before consuming budget even without Origin', async () => {
  for (const type of [undefined,'application/x-www-form-urlencoded','text/plain','multipart/form-data','application/jsonx']) {
    const h=harness();const r=await h.login({headers:{origin:undefined,'content-type':type}});
    assert.equal(r.statusCode,415);assert.equal(h.calls.length,0);assert.equal(h.memberReads,0);assert.equal(r.headers['set-cookie'],undefined);
  }
  const h=harness();const r=await h.login({headers:{'content-type':'application/json; charset=utf-8'}});assert.equal(r.statusCode,200);
});
