-- UNAPPLIED PREPARATION. No real staff factor or public activation is created.
create table home_ready.staff_card_mfa(
 member_id uuid primary key references home_ready.team_members(id),seed_id uuid not null,
 envelope jsonb not null check(jsonb_typeof(envelope)='object' and octet_length(envelope::text) between 80 and 2048 and envelope-array['v','iv','tag','ciphertext']='{}'),
 key_id text not null check(key_id ~ '^[A-Za-z0-9:_/-]{1,100}$'),credential_version text not null check(credential_version ~ '^[a-f0-9]{64}$'),
 pending_expires_at timestamptz not null,confirmed_at timestamptz,last_step bigint not null default -1,
 created_at timestamptz not null default clock_timestamp()
);
create table home_ready.card_reveal_grants(
 grant_hash text primary key check(grant_hash ~ '^[a-f0-9]{64}$'),member_id uuid not null references home_ready.team_members(id),
 enrollment_id uuid not null references home_ready.enrollments(id),session_binding text not null check(session_binding ~ '^[a-f0-9]{64}$'),
 credential_version text not null check(credential_version ~ '^[a-f0-9]{64}$'),expires_at timestamptz not null,consumed_at timestamptz,created_at timestamptz not null default clock_timestamp()
);
create table home_ready.card_access_attempts(
 key_hash text not null,scope text not null check(scope in ('setup','confirm','grant')),window_start timestamptz not null,
 attempts integer not null check(attempts between 1 and 1000),primary key(key_hash,scope,window_start)
);
alter table home_ready.staff_card_mfa enable row level security;
alter table home_ready.card_reveal_grants enable row level security;
alter table home_ready.card_access_attempts enable row level security;
revoke all on home_ready.staff_card_mfa,home_ready.card_reveal_grants,home_ready.card_access_attempts from public,anon,authenticated,service_role;
grant select,insert,update on home_ready.staff_card_mfa,home_ready.card_reveal_grants,home_ready.card_access_attempts to service_role;
create function home_ready.valid_card_staff(p_actor uuid,p_version text) returns boolean language sql stable security invoker set search_path=pg_catalog as $$
 select exists(select 1 from home_ready.team_members where id=p_actor and role='admin' and encode(sha256(convert_to(password_hash,'UTF8')),'hex')=p_version);
$$;
revoke all on function home_ready.valid_card_staff(uuid,text) from public,anon,authenticated,service_role;
grant execute on function home_ready.valid_card_staff(uuid,text) to service_role;
create function home_ready.consume_card_access_budget(p_actor uuid,p_network text,p_scope text) returns boolean language plpgsql security invoker set search_path=pg_catalog as $$
declare t timestamptz=clock_timestamp();w timestamptz;b record;n integer;allowed boolean=true;
begin
 if p_actor is null or coalesce(p_network,'') !~ '^[a-f0-9]{64}$' or coalesce(p_scope,'') not in ('setup','confirm','grant') then raise exception 'Invalid card access budget' using errcode='22023';end if;
 w=date_trunc('hour',t)+floor(extract(minute from t)/15)*interval '15 minutes';
 for b in select * from (values ('actor:'||p_actor::text,5),('network:'||p_network,20)) as limits(k,maximum) order by k loop
 insert into home_ready.card_access_attempts as existing(key_hash,scope,window_start,attempts) values(b.k,p_scope,w,1) on conflict(key_hash,scope,window_start) do update set attempts=least(existing.attempts+1,1000) returning attempts into n;
 if n>b.maximum then allowed=false;end if;
 end loop;return allowed;
end $$;
revoke all on function home_ready.consume_card_access_budget(uuid,text,text) from public,anon,authenticated,service_role;
grant execute on function home_ready.consume_card_access_budget(uuid,text,text) to service_role;
create function home_ready.start_card_mfa(p_actor uuid,p_version text,p_seed uuid,p_envelope jsonb,p_key_id text) returns jsonb language plpgsql security invoker set search_path=pg_catalog as $$
declare r home_ready.staff_card_mfa%rowtype;
begin
 perform 1 from home_ready.team_members where id=p_actor for share;
 if not home_ready.valid_card_staff(p_actor,p_version) then raise exception 'Current administrator access required' using errcode='42501';end if;
 select * into r from home_ready.staff_card_mfa where member_id=p_actor for update;
 if found and r.confirmed_at is not null then raise exception 'Card access MFA already configured; no reset path is available' using errcode='PT409';end if;
 insert into home_ready.staff_card_mfa(member_id,seed_id,envelope,key_id,credential_version,pending_expires_at) values(p_actor,p_seed,p_envelope,p_key_id,p_version,clock_timestamp()+interval '10 minutes')
 on conflict(member_id) do update set seed_id=excluded.seed_id,envelope=excluded.envelope,key_id=excluded.key_id,credential_version=excluded.credential_version,pending_expires_at=excluded.pending_expires_at,last_step=-1;
 return jsonb_build_object('seed_id',p_seed,'expires_at',clock_timestamp()+interval '10 minutes');
end $$;
create function home_ready.get_card_mfa(p_actor uuid,p_version text) returns jsonb language plpgsql security invoker set search_path=pg_catalog as $$
declare r home_ready.staff_card_mfa%rowtype;
begin
 if not home_ready.valid_card_staff(p_actor,p_version) then raise exception 'Current administrator access required' using errcode='42501';end if;
 select * into r from home_ready.staff_card_mfa where member_id=p_actor;
 if not found then raise exception 'Card access MFA not configured' using errcode='PT404';end if;
 return to_jsonb(r)-'member_id'-'credential_version';
end $$;
create function home_ready.confirm_card_mfa(p_actor uuid,p_version text,p_seed uuid,p_step bigint) returns boolean language plpgsql security invoker set search_path=pg_catalog as $$
begin
 perform 1 from home_ready.team_members where id=p_actor for share;
 if not home_ready.valid_card_staff(p_actor,p_version) then raise exception 'Current administrator access required' using errcode='42501';end if;
 if abs(p_step-floor(extract(epoch from clock_timestamp())/30)::bigint)>1 then raise exception 'Expired verification code' using errcode='PT409';end if;
 update home_ready.staff_card_mfa set confirmed_at=clock_timestamp(),last_step=p_step where member_id=p_actor and seed_id=p_seed and credential_version=p_version and confirmed_at is null and pending_expires_at>clock_timestamp() and last_step<p_step;
 if not found then raise exception 'Verification code expired or already used' using errcode='PT409';end if;return true;
end $$;
create function home_ready.issue_card_reveal_grant(p_actor uuid,p_version text,p_seed uuid,p_step bigint,p_session text,p_enrollment uuid,p_grant text) returns jsonb language plpgsql security invoker set search_path=pg_catalog as $$
declare expiry timestamptz=clock_timestamp()+interval '60 seconds';
begin
 perform 1 from home_ready.team_members where id=p_actor for share;
 if not home_ready.valid_card_staff(p_actor,p_version) then raise exception 'Current administrator access required' using errcode='42501';end if;
 if p_session !~ '^[a-f0-9]{64}$' or p_grant !~ '^[a-f0-9]{64}$' or abs(p_step-floor(extract(epoch from clock_timestamp())/30)::bigint)>1 then raise exception 'Expired or invalid verification code' using errcode='PT409';end if;
 perform 1 from home_ready.enrollment_card_vault v join home_ready.enrollments e on e.id=v.enrollment_id and e.submission_key=v.submission_key where v.enrollment_id=p_enrollment and e.enrollment_source='website_manual';
 if not found then raise exception 'Card target unavailable' using errcode='PT404';end if;
 update home_ready.staff_card_mfa set last_step=p_step where member_id=p_actor and seed_id=p_seed and confirmed_at is not null and last_step<p_step;
 if not found then raise exception 'Verification code already used; use a new code' using errcode='PT409';end if;
 insert into home_ready.card_reveal_grants(grant_hash,member_id,enrollment_id,session_binding,credential_version,expires_at) values(p_grant,p_actor,p_enrollment,p_session,p_version,expiry);
 return jsonb_build_object('expires_at',expiry);
end $$;
revoke all on function home_ready.start_card_mfa(uuid,text,uuid,jsonb,text),home_ready.get_card_mfa(uuid,text),home_ready.confirm_card_mfa(uuid,text,uuid,bigint),home_ready.issue_card_reveal_grant(uuid,text,uuid,bigint,text,uuid,text) from public,anon,authenticated,service_role;
grant execute on function home_ready.start_card_mfa(uuid,text,uuid,jsonb,text),home_ready.get_card_mfa(uuid,text),home_ready.confirm_card_mfa(uuid,text,uuid,bigint),home_ready.issue_card_reveal_grant(uuid,text,uuid,bigint,text,uuid,text) to service_role;
-- Retire the prior role-only preparation path. Final reads require a one-use MFA grant.
revoke all on function home_ready.read_enrollment_card(uuid,uuid) from public,anon,authenticated,service_role;
create function home_ready.read_enrollment_card_with_grant(p_id uuid,p_actor uuid,p_version text,p_session text,p_grant text) returns jsonb language plpgsql security invoker set search_path=pg_catalog as $$
declare stored home_ready.enrollment_card_vault%rowtype;
begin
 perform 1 from home_ready.team_members where id=p_actor for share;
 if not home_ready.valid_card_staff(p_actor,p_version) then raise exception 'Current administrator access required' using errcode='42501';end if;
 update home_ready.card_reveal_grants set consumed_at=clock_timestamp() where grant_hash=p_grant and member_id=p_actor and enrollment_id=p_id and credential_version=p_version and session_binding=p_session and expires_at>clock_timestamp() and consumed_at is null;
 if not found then raise exception 'Reveal grant unavailable or already used' using errcode='PT403';end if;
 select v.* into stored from home_ready.enrollment_card_vault v join home_ready.enrollments e on e.id=v.enrollment_id and e.submission_key=v.submission_key where v.enrollment_id=p_id and e.enrollment_source='website_manual';
 if not found then raise exception 'Saved card unavailable' using errcode='PT404';end if;
 insert into home_ready.enrollment_card_access_audit(enrollment_id,actor_id,action) values(stored.enrollment_id,p_actor,'reveal_authorized');
 return jsonb_build_object('enrollment_id',stored.enrollment_id,'submission_key',stored.submission_key,'envelope',stored.envelope,'key_id',stored.key_id,'last4',stored.last4);
end $$;
revoke all on function home_ready.read_enrollment_card_with_grant(uuid,uuid,text,text,text) from public,anon,authenticated,service_role;
grant execute on function home_ready.read_enrollment_card_with_grant(uuid,uuid,text,text,text) to service_role;
