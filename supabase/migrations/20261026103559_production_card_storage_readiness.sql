-- Read-only production readiness contract; no client/card/seed data returned.
create function home_ready.card_storage_readiness() returns jsonb
language sql stable security invoker set search_path=pg_catalog as $$
with tables(name,needs_update) as(values
 ('home_ready.enrollment_card_vault',false),('home_ready.enrollment_card_access_audit',false),
 ('home_ready.staff_card_mfa',true),('home_ready.card_reveal_grants',true),('home_ready.card_access_attempts',true)
), functions(signature) as(values
 ('home_ready.save_enrollment_card(uuid,text,jsonb,jsonb,uuid,text,jsonb,text,text,text,text)'),
 ('home_ready.read_enrollment_card_with_grant(uuid,uuid,text,text,text)'),
 ('home_ready.start_card_mfa(uuid,text,uuid,jsonb,text)'),('home_ready.get_card_mfa(uuid,text)'),
 ('home_ready.confirm_card_mfa(uuid,text,uuid,bigint)'),('home_ready.issue_card_reveal_grant(uuid,text,uuid,bigint,text,uuid,text)'),
 ('home_ready.consume_card_access_budget(uuid,text,text)'),('home_ready.valid_card_staff(uuid,text)'),
 ('home_ready.enrollment_card_metadata(uuid,uuid)')
), checks as(select
 current_user='service_role'
 and not exists(select 1 from tables t where
   (select c.relrowsecurity from pg_class c where c.oid=to_regclass(t.name)) is distinct from true
   or not coalesce(has_table_privilege(current_user,to_regclass(t.name),'SELECT'),false)
   or not coalesce(has_table_privilege(current_user,to_regclass(t.name),'INSERT'),false)
   or coalesce(has_table_privilege(current_user,to_regclass(t.name),'UPDATE'),false) is distinct from t.needs_update
   or coalesce(has_table_privilege(current_user,to_regclass(t.name),'DELETE'),false)
   or coalesce(has_table_privilege(current_user,to_regclass(t.name),'TRUNCATE'),false))
 and not exists(select 1 from tables t cross join(values('anon'),('authenticated'))roles(name)
   cross join(values('SELECT'),('INSERT'),('UPDATE'),('DELETE'),('TRUNCATE'),('REFERENCES'),('TRIGGER'))privileges(name)
   where coalesce(has_table_privilege(roles.name,to_regclass(t.name),privileges.name),false))
 and not exists(select 1 from functions f where
   to_regprocedure(f.signature) is null
   or not coalesce(has_function_privilege(current_user,to_regprocedure(f.signature),'EXECUTE'),false)
   or (select p.prosecdef from pg_proc p where p.oid=to_regprocedure(f.signature)) is distinct from false
   or not coalesce((select p.proconfig @> array['search_path=pg_catalog'] from pg_proc p where p.oid=to_regprocedure(f.signature)),false)
   or coalesce(has_function_privilege('anon',to_regprocedure(f.signature),'EXECUTE'),false)
   or coalesce(has_function_privilege('authenticated',to_regprocedure(f.signature),'EXECUTE'),false))
 and exists(select 1 from pg_index i where i.indexrelid=to_regclass('home_ready.enrollments_card_context') and i.indrelid=to_regclass('home_ready.enrollments') and i.indisunique and i.indisvalid and i.indisready and i.indpred is null and i.indexprs is null and i.indnkeyatts=2 and array(select unnest(i.indkey))=array[(select attnum from pg_attribute where attrelid=to_regclass('home_ready.enrollments') and attname='id'),(select attnum from pg_attribute where attrelid=to_regclass('home_ready.enrollments') and attname='submission_key')]::smallint[])
 and exists(select 1 from pg_constraint c where c.contype='f' and c.conrelid=to_regclass('home_ready.enrollment_card_vault') and c.confrelid=to_regclass('home_ready.enrollments') and c.convalidated and not c.condeferrable
   and c.conkey=array[(select attnum from pg_attribute where attrelid=c.conrelid and attname='enrollment_id'),(select attnum from pg_attribute where attrelid=c.conrelid and attname='submission_key')]::smallint[]
   and c.confkey=array[(select attnum from pg_attribute where attrelid=c.confrelid and attname='id'),(select attnum from pg_attribute where attrelid=c.confrelid and attname='submission_key')]::smallint[])
 and exists(select 1 from pg_trigger t join pg_proc p on p.oid=t.tgfoid where t.tgrelid=to_regclass('home_ready.enrollment_card_vault') and t.tgname='immutable_enrollment_card_context' and not t.tgisinternal and t.tgenabled in ('O','A') and t.tgtype=19 and t.tgfoid=to_regprocedure('home_ready.immutable_card_context()') and not p.prosecdef and p.proconfig @> array['search_path=pg_catalog'])
 and not coalesce(has_function_privilege(current_user,to_regprocedure('home_ready.read_enrollment_card(uuid,uuid)'),'EXECUTE'),false)
 as ready)
select jsonb_build_object('ready',checks.ready,'version','hrs-card-runtime-v1','schema','home_ready',
 'card_key_ids',coalesce((select jsonb_agg(key_id order by key_id) from(select distinct key_id from home_ready.enrollment_card_vault)q),'[]'::jsonb),
 'mfa_key_ids',coalesce((select jsonb_agg(key_id order by key_id) from(select distinct key_id from home_ready.staff_card_mfa)q),'[]'::jsonb)) from checks;
$$;
revoke all on function home_ready.card_storage_readiness() from public,anon,authenticated,service_role;
grant execute on function home_ready.card_storage_readiness() to service_role;
