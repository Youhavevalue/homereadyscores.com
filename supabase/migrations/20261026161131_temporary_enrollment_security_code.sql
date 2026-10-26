-- Temporary pre-authorization code only. NEVER include this unlogged table in logical exports.
-- Current project uses physical backups (live dashboard checked 2026-10-26).
-- Repeated authorized staff viewing and updates are supported before payment authorization.
-- Staff must remove CVV after the related authorization; marking initial payment paid also removes it.
create unlogged table home_ready.enrollment_security_codes (
 enrollment_id uuid primary key,
 submission_key uuid not null unique,
 envelope jsonb not null check(jsonb_typeof(envelope)='object' and envelope->>'v'='1' and envelope ?& array['v','iv','tag','ciphertext'] and envelope-array['v','iv','tag','ciphertext','context']='{}'::jsonb and octet_length(envelope::text) between 80 and 1024),
 key_id text not null check(key_id ~ '^[A-Za-z0-9:_/-]{1,100}$'),
 created_at timestamptz not null default clock_timestamp(),
 foreign key(enrollment_id,submission_key) references home_ready.enrollments(id,submission_key)
);
alter table home_ready.enrollment_security_codes enable row level security;
revoke all on home_ready.enrollment_security_codes from public,anon,authenticated,service_role;
grant select,insert,delete on home_ready.enrollment_security_codes to service_role;

create function home_ready.enrollment_security_code_readiness() returns jsonb
language sql stable security invoker set search_path=pg_catalog as $$
select jsonb_build_object('ready',
 current_user='service_role'
 and to_regprocedure('home_ready.modify_enrollment_security_code_with_grant(uuid,uuid,text,text,text,text,jsonb,text)') is not null
 and exists(select 1 from pg_trigger where tgrelid='home_ready.enrollments'::regclass and tgname='remove_security_code_after_payment' and tgenabled in ('O','A'))
 and exists(select 1 from pg_class where oid=to_regclass('home_ready.enrollment_security_codes') and relpersistence='u' and relrowsecurity)
 and has_table_privilege(current_user,'home_ready.enrollment_security_codes','SELECT,INSERT,DELETE')
 and not has_table_privilege(current_user,'home_ready.enrollment_security_codes','UPDATE')
 and not exists(select 1 from (values('anon'),('authenticated'))r(name) cross join (values('SELECT'),('INSERT'),('UPDATE'),('DELETE'),('TRUNCATE'))p(name) where has_table_privilege(r.name,'home_ready.enrollment_security_codes',p.name)),
 'version','hrs-temporary-code-v1');
$$;
revoke all on function home_ready.enrollment_security_code_readiness() from public,anon,authenticated;
grant execute on function home_ready.enrollment_security_code_readiness() to service_role;

create function home_ready.save_enrollment_card_with_security_code(p_key uuid,p_fingerprint text,p_request jsonb,p_attribution jsonb,p_session uuid,p_network text,p_envelope jsonb,p_card_fingerprint text,p_key_id text,p_last4 text,p_funnel_token text,p_code_envelope jsonb,p_code_key_id text) returns jsonb
language plpgsql security invoker set search_path=pg_catalog as $$
declare result jsonb;
begin
 if (home_ready.enrollment_security_code_readiness()->>'ready') is distinct from 'true' then raise exception 'Temporary code storage unavailable' using errcode='55000';end if;
 if p_code_envelope is null or jsonb_typeof(p_code_envelope)<>'object' or p_code_envelope->>'v' is distinct from '1'
 or not(p_code_envelope ?& array['v','iv','tag','ciphertext']) or p_code_envelope-array['v','iv','tag','ciphertext']<>'{}'::jsonb
 or octet_length(p_code_envelope::text) not between 80 and 1024
 or jsonb_typeof(p_code_envelope->'iv') is distinct from 'string' or length(p_code_envelope->>'iv')<>16
 or jsonb_typeof(p_code_envelope->'tag') is distinct from 'string' or length(p_code_envelope->>'tag')<>24
 or jsonb_typeof(p_code_envelope->'ciphertext') is distinct from 'string' or length(p_code_envelope->>'ciphertext') not between 4 and 128
 or coalesce(p_code_key_id,'') !~ '^[A-Za-z0-9:_/-]{1,100}$'
 then raise exception 'Invalid temporary code envelope' using errcode='22023';end if;
 result=home_ready.save_enrollment_card(p_key,p_fingerprint,p_request,p_attribution,p_session,p_network,p_envelope,p_card_fingerprint,p_key_id,p_last4,p_funnel_token);
 if result->>'card_saved' is distinct from 'true' then return result;end if;
 -- A replay never restores a code already removed or lost after a database restart.
 if result->>'replayed' is distinct from 'true' then
 insert into home_ready.enrollment_security_codes(enrollment_id,submission_key,envelope,key_id) values((result->>'request_id')::uuid,p_key,p_code_envelope,p_code_key_id);
 end if;
 return result||jsonb_build_object('security_code_saved',exists(select 1 from home_ready.enrollment_security_codes where enrollment_id=(result->>'request_id')::uuid));
end $$;
revoke all on function home_ready.save_enrollment_card_with_security_code(uuid,text,jsonb,jsonb,uuid,text,jsonb,text,text,text,text,jsonb,text) from public,anon,authenticated;
grant execute on function home_ready.save_enrollment_card_with_security_code(uuid,text,jsonb,jsonb,uuid,text,jsonb,text,text,text,text,jsonb,text) to service_role;

create or replace function home_ready.read_enrollment_card_with_grant(p_id uuid,p_actor uuid,p_version text,p_session text,p_grant text) returns jsonb language plpgsql security invoker set search_path=pg_catalog as $$
declare stored home_ready.enrollment_card_vault%rowtype; code home_ready.enrollment_security_codes%rowtype; result jsonb;
begin
 perform 1 from home_ready.team_members where id=p_actor for share;
 if not home_ready.valid_card_staff(p_actor,p_version) then raise exception 'Current administrator access required' using errcode='42501';end if;
 update home_ready.card_reveal_grants set consumed_at=clock_timestamp() where grant_hash=p_grant and member_id=p_actor and enrollment_id=p_id and credential_version=p_version and session_binding=p_session and expires_at>clock_timestamp() and consumed_at is null;
 if not found then raise exception 'Reveal grant unavailable or already used' using errcode='PT403';end if;
 select v.* into stored from home_ready.enrollment_card_vault v join home_ready.enrollments e on e.id=v.enrollment_id and e.submission_key=v.submission_key where v.enrollment_id=p_id and e.enrollment_source='website_manual';
 if not found then raise exception 'Saved card unavailable' using errcode='PT404';end if;
 insert into home_ready.enrollment_card_access_audit(enrollment_id,actor_id,action) values(stored.enrollment_id,p_actor,'reveal_authorized');
 result=jsonb_build_object('enrollment_id',stored.enrollment_id,'submission_key',stored.submission_key,'envelope',stored.envelope,'key_id',stored.key_id,'last4',stored.last4);
 -- Reads do not consume CVV. Staff can view and correct pending initial-payment details.
 select * into code from home_ready.enrollment_security_codes where enrollment_id=p_id and submission_key=stored.submission_key;
 if found and (select relpersistence from pg_class where oid='home_ready.enrollment_security_codes'::regclass)='u'
 and exists(select 1 from home_ready.enrollments where id=p_id and coalesce(setup_fee_status,'pending')<>'paid')
 and not exists(select 1 from home_ready.enrollment_security_code_events where enrollment_id=p_id and action='authorization_recorded')
 then result=result||jsonb_build_object('security_code_envelope',code.envelope,'security_code_key_id',code.key_id);end if;
 return result;
end $$;

create table home_ready.enrollment_security_code_events(
 id uuid primary key default gen_random_uuid(), enrollment_id uuid not null references home_ready.enrollments(id),
 actor_id uuid not null references home_ready.team_members(id), action text not null check(action in ('updated','authorization_recorded')),
 created_at timestamptz not null default clock_timestamp()
);
alter table home_ready.enrollment_security_code_events enable row level security;
revoke all on home_ready.enrollment_security_code_events from public,anon,authenticated,service_role;
grant select,insert on home_ready.enrollment_security_code_events to service_role;

create function home_ready.modify_enrollment_security_code_with_grant(p_id uuid,p_actor uuid,p_version text,p_session text,p_grant text,p_action text,p_envelope jsonb,p_key_id text) returns jsonb
language plpgsql security invoker set search_path=pg_catalog as $$
declare enrollment home_ready.enrollments%rowtype;
begin
 perform 1 from home_ready.team_members where id=p_actor for share;
 if not home_ready.valid_card_staff(p_actor,p_version) then raise exception 'Current administrator access required' using errcode='42501';end if;
 if p_action not in ('updateCVV','clearCVV') then raise exception 'Choose a valid card action' using errcode='22023';end if;
 if p_action='updateCVV' then
 update home_ready.card_reveal_grants set consumed_at=clock_timestamp() where grant_hash=p_grant and member_id=p_actor and enrollment_id=p_id and credential_version=p_version and session_binding=p_session and expires_at>clock_timestamp() and consumed_at is null;
 if not found then raise exception 'Reveal grant unavailable or already used' using errcode='PT403';end if;
 end if;
 select * into enrollment from home_ready.enrollments where id=p_id for update;
 if not found or not exists(select 1 from home_ready.enrollment_card_vault where enrollment_id=p_id and submission_key=enrollment.submission_key) then raise exception 'Saved card unavailable' using errcode='PT404';end if;
 if p_action='updateCVV' and (coalesce(enrollment.setup_fee_status,'pending')='paid' or exists(select 1 from home_ready.enrollment_security_code_events where enrollment_id=p_id and action='authorization_recorded')) then raise exception 'The initial payment is already recorded. Do not retain a security code after authorization.' using errcode='22023';end if;
 if p_action='updateCVV' and ((home_ready.enrollment_security_code_readiness()->>'ready') is distinct from 'true' or p_envelope is null or jsonb_typeof(p_envelope)<>'object' or p_envelope->>'v' is distinct from '1' or not(p_envelope ?& array['v','iv','tag','ciphertext']) or p_envelope-array['v','iv','tag','ciphertext','context']<>'{}'::jsonb or octet_length(p_envelope::text) not between 80 and 1024 or coalesce(p_key_id,'') !~ '^[A-Za-z0-9:_/-]{1,100}$') then raise exception 'Card update unavailable' using errcode='22023';end if;
 delete from home_ready.enrollment_security_codes where enrollment_id=p_id;
 if p_action='updateCVV' then insert into home_ready.enrollment_security_codes(enrollment_id,submission_key,envelope,key_id) values(p_id,enrollment.submission_key,p_envelope,p_key_id);end if;
 insert into home_ready.enrollment_security_code_events(enrollment_id,actor_id,action) values(p_id,p_actor,case when p_action='updateCVV' then 'updated' else 'authorization_recorded' end);
 return jsonb_build_object('success',true,'securityCodeSaved',p_action='updateCVV');
end $$;
revoke all on function home_ready.modify_enrollment_security_code_with_grant(uuid,uuid,text,text,text,text,jsonb,text) from public,anon,authenticated;
grant execute on function home_ready.modify_enrollment_security_code_with_grant(uuid,uuid,text,text,text,text,jsonb,text) to service_role;

create function home_ready.remove_security_code_after_payment() returns trigger
language plpgsql security invoker set search_path=pg_catalog as $$
begin
 if new.setup_fee_status='paid' then delete from home_ready.enrollment_security_codes where enrollment_id=new.id;end if;
 return new;
end $$;
revoke all on function home_ready.remove_security_code_after_payment() from public,anon,authenticated;
create trigger remove_security_code_after_payment after update of setup_fee_status on home_ready.enrollments for each row execute function home_ready.remove_security_code_after_payment();
