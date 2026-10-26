const {test}=require('node:test');
const assert=require('node:assert/strict');
const {mkdtemp,rm,readFile}=require('node:fs/promises');
const {tmpdir}=require('node:os');
const {join}=require('node:path');
const {randomUUID,randomBytes,createHash}=require('node:crypto');
async function setup(t){
 const {openCardFixture}=await import('./fixtures/production-card-db.mjs');
 const dir=await mkdtemp(join(tmpdir(),'hrs-code-')),db=await openCardFixture(dir);

 const {createEnvelopeCrypto,createPreparedCardService}=await import('../api/_lib/production-card-adapter.js');
 const crypto=createEnvelopeCrypto({keyResolver:async()=>({keyId:'test-key',key:Buffer.alloc(32,7)})});
 const actor=randomUUID();await db.pg.query("INSERT INTO home_ready.team_members(id,email,name,role,password_hash) VALUES($1,'code@example.test','Fictional admin','admin','test-only')",[actor]);
 const service=createPreparedCardService({db,crypto,securityCodeEnabled:true,revealGuard:{authorize:async(request,enrollmentId)=>{
  const credentialVersion=createHash('sha256').update('test-only').digest('hex'),sessionBinding=createHash('sha256').update('synthetic-session-fixture').digest('hex'),grantHash=randomBytes(32).toString('hex');
  await db.pg.query("INSERT INTO home_ready.card_reveal_grants(grant_hash,member_id,enrollment_id,session_binding,credential_version,expires_at) VALUES($1,$2,$3,$4,$5,now()+interval '60 seconds')",[grantHash,actor,enrollmentId,sessionBinding,credentialVersion]);return{memberId:actor,enrollmentId,sessionBinding,credentialVersion,grantHash};
 }}});
 const input=()=>({submissionKey:randomUUID(),sessionId:randomUUID(),networkKey:'a'.repeat(64),request:{first_name:'Fictional',last_name:'Code',email:'code@example.test',phone:'2025550100',goal:'Buy a Home',plan:'single',billing_zip:'75001',credit_report_agreement:true},card:{name:'FICTIONAL',number:'4111111111111111',expiry:'12/30',cvv:'627',billingAddressLine1:'100 Example Way',billingAddressLine2:'',billingCity:'Austin',billingState:'TX',billingZip:'75001'}});
 const reveal=requestId=>service.reveal({requestId,request:{headers:{cookie:'hrs_local_session=synthetic-session-fixture'}}});
 t.after(async()=>{await db.pg.close();await rm(dir,{recursive:true,force:true});});return{db,service,crypto,input,reveal};
}
test('security-code validation supports three digits and four-digit Amex without echoing input',async()=>{
 const {checkSecurityCode}=await import('../shared/card-entry-format.js');assert.equal(typeof checkSecurityCode,'function');
 assert.equal(checkSecurityCode('627','4111111111111111').ok,true);assert.equal(checkSecurityCode('6274','371449635398431').ok,true);
 for(const [value,number]of [['','4111111111111111'],['12','4111111111111111'],['6274','4111111111111111'],['627','371449635398431'],['a27','4111111111111111']]){const r=checkSecurityCode(value,number);assert.equal(r.ok,false);assert.equal(r.error.includes(value)&&value.length>0,false);}
});
test('saved code supports repeated staff viewing, updates, and explicit removal',async t=>{
 const s=await setup(t),input=s.input(),saved=await s.service.save(input);
 const row=(await s.db.pg.query('SELECT * FROM home_ready.enrollment_security_codes')).rows[0];assert.ok(row);assert.equal(JSON.stringify(row).includes('627'),false);
 const vault=(await s.db.pg.query('SELECT * FROM home_ready.enrollment_card_vault')).rows[0];assert.equal('cvv' in await s.crypto.open(input.submissionKey,vault.envelope,vault.key_id),false);
 assert.equal((await s.reveal(saved.requestId)).card.cvv,'627');assert.equal((await s.reveal(saved.requestId)).card.cvv,'627');
 const request={headers:{cookie:'hrs_local_session=synthetic-session-fixture'}};
 await s.service.modifySecurityCode({requestId:saved.requestId,request,action:'updateCVV',cvv:'841'});
 assert.equal((await s.reveal(saved.requestId)).card.cvv,'841');
 await s.service.modifySecurityCode({requestId:saved.requestId,request,action:'clearCVV'});
 assert.equal((await s.reveal(saved.requestId)).card.cvv,undefined);
 await assert.rejects(s.service.modifySecurityCode({requestId:saved.requestId,request,action:'updateCVV',cvv:'627'}));
 assert.equal((await s.service.save(input)).requestId,saved.requestId);assert.equal((await s.reveal(saved.requestId)).card.cvv,undefined);
});
test('invalid codes and failed temporary save leave no partial enrollment; marking payment paid removes CVV',async t=>{
 const s=await setup(t);
 for(const value of ['', '12','6274','bad'])await assert.rejects(s.service.save({...s.input(),card:{...s.input().card,cvv:value}}),/security code/i);
 assert.equal((await s.db.pg.query('SELECT count(*)::int n FROM home_ready.enrollments')).rows[0].n,0);
 const saved=await s.service.save(s.input());await s.db.pg.query("UPDATE home_ready.enrollments SET setup_fee_status='paid'");assert.equal((await s.reveal(saved.requestId)).card.cvv,undefined);
 assert.equal((await s.db.pg.query('SELECT count(*)::int n FROM home_ready.enrollment_security_codes')).rows[0].n,0);
 await s.db.pg.exec('ALTER TABLE home_ready.enrollment_security_codes ADD CONSTRAINT forced_failure CHECK(false)');await assert.rejects(s.service.save(s.input()));assert.equal((await s.db.pg.query('SELECT count(*)::int n FROM home_ready.enrollments')).rows[0].n,1);
});
test('CVV table is unlogged and client roles have no access',async t=>{
 const s=await setup(t);assert.equal((await s.db.pg.query("SELECT relpersistence FROM pg_class WHERE oid='home_ready.enrollment_security_codes'::regclass")).rows[0].relpersistence,'u');
 for(const role of ['anon','authenticated'])await assert.rejects(s.db.pg.transaction(async tx=>{await tx.exec('SET LOCAL ROLE '+role);await tx.exec('SELECT * FROM home_ready.enrollment_security_codes');}),/permission denied/);
});
