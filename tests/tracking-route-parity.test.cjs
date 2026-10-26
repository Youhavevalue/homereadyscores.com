const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs/promises');
test('every published page can persist a tracked visit and attribution; private paths remain rejected',async()=>{
 const {PGlite}=await import('@electric-sql/pglite');
 const {PUBLIC_PAGES}=await import('../shared/public-pages.js');
 const pg=new PGlite();await pg.waitReady;
 try{
  await pg.exec(`create schema home_ready; create table home_ready.activity_log(entity_type text,entity_id uuid,action text,actor_type text,metadata jsonb,created_at timestamptz); create function home_ready.consume_website_budget(text,uuid,text) returns boolean language sql as 'select true';`);
  await pg.exec(await fs.readFile(new URL('fixtures/existing-website-tracking.sql','file://'+__filename),'utf8'));
  const migration=await fs.readFile(new URL('../supabase/migrations/20261026193544_sync_public_tracking_routes.sql','file://'+__filename),'utf8');
  if(migration.trim())await pg.exec(migration);
  for(const route of Object.keys(PUBLIC_PAGES)){
   const attr={utm_source:'tiktok',utm_medium:'social',landing_path:route};
   assert.equal((await pg.query('select home_ready.valid_website_attribution($1::jsonb) ok',[JSON.stringify(attr)])).rows[0].ok,true,route+' attribution');
   const result=await pg.query("select home_ready.record_website_event(gen_random_uuid(),'visit',$1,$2::jsonb,'route-qa') result",[route,JSON.stringify(attr)]);
   assert.equal(result.rows[0].result.recorded,true,route+' visit');
  }
  assert.equal((await pg.query('select count(*)::int n from home_ready.activity_log')).rows[0].n,Object.keys(PUBLIC_PAGES).length);
  for(const route of ['/admin','/admin/clients','/sign-contract','/articles/unregistered','/private']){
   assert.equal((await pg.query('select home_ready.valid_website_attribution($1::jsonb) ok',[JSON.stringify({landing_path:route})])).rows[0].ok,false,route);
   await assert.rejects(pg.query("select home_ready.record_website_event(gen_random_uuid(),'visit',$1,'{}'::jsonb,'route-qa')",[route]));
  }
 }finally{await pg.close();}
});
