-- PREPARATION ONLY. Not applied remotely. Real capture/reveal handlers remain disabled.
-- Verify exact app/environment/project/schema and operational controls before any apply.
create unique index enrollments_card_context on home_ready.enrollments(id,submission_key);
create table home_ready.enrollment_card_vault(
 enrollment_id uuid primary key,
 submission_key uuid not null unique,
 envelope jsonb not null check(jsonb_typeof(envelope)='object' and octet_length(envelope::text) between 80 and 8192 and envelope->>'v'='1' and envelope ?& array['v','iv','tag','ciphertext'] and envelope-array['v','iv','tag','ciphertext']='{}'::jsonb),
 key_id text not null check(key_id ~ '^[A-Za-z0-9:_/-]{1,100}$'),
 card_fingerprint text not null check(card_fingerprint ~ '^[a-f0-9]{64}$'),
 last4 text not null check(last4 ~ '^[0-9]{4}$'),
 created_at timestamptz not null default clock_timestamp(),
 updated_at timestamptz not null default clock_timestamp(),
 foreign key(enrollment_id,submission_key) references home_ready.enrollments(id,submission_key)
);
create table home_ready.enrollment_card_access_audit(
 id uuid primary key default gen_random_uuid(),
 enrollment_id uuid not null references home_ready.enrollments(id),
 actor_id uuid not null references home_ready.team_members(id),
 action text not null check(action='reveal_authorized'),
 created_at timestamptz not null default clock_timestamp()
);
alter table home_ready.enrollment_card_vault enable row level security;
alter table home_ready.enrollment_card_access_audit enable row level security;
revoke all on home_ready.enrollment_card_vault,home_ready.enrollment_card_access_audit from public,anon,authenticated,service_role;
grant select,insert on home_ready.enrollment_card_vault,home_ready.enrollment_card_access_audit to service_role;
-- No service-role update/delete grant: rotation/deletion require a separately reviewed path.
create function home_ready.immutable_card_context() returns trigger language plpgsql security invoker set search_path=pg_catalog as $$
begin
 if new.enrollment_id<>old.enrollment_id or new.submission_key<>old.submission_key then raise exception 'Card context is immutable' using errcode='22023';end if;
 return new;
end $$;
create trigger immutable_enrollment_card_context before update on home_ready.enrollment_card_vault for each row execute function home_ready.immutable_card_context();
revoke all on function home_ready.immutable_card_context() from public,anon,authenticated;

create function home_ready.save_enrollment_card(p_key uuid,p_fingerprint text,p_request jsonb,p_attribution jsonb,p_session uuid,p_network text,p_envelope jsonb,p_card_fingerprint text,p_key_id text,p_last4 text,p_funnel_token text default null) returns jsonb
language plpgsql security invoker set search_path=pg_catalog as $$
declare result jsonb; enrollment home_ready.enrollments%rowtype; saved home_ready.enrollment_card_vault%rowtype;
begin
 if p_key is null or p_envelope is null or jsonb_typeof(p_envelope)<>'object' or octet_length(p_envelope::text) not between 80 and 8192
 or p_envelope->>'v' is distinct from '1' or not(p_envelope ?& array['v','iv','tag','ciphertext'])
 or exists(select 1 from jsonb_object_keys(p_envelope) k where k not in ('v','iv','tag','ciphertext'))
 or jsonb_typeof(p_envelope->'iv') is distinct from 'string' or jsonb_typeof(p_envelope->'tag') is distinct from 'string' or jsonb_typeof(p_envelope->'ciphertext') is distinct from 'string'
 or length(p_envelope->>'iv')<>16 or length(p_envelope->>'tag')<>24 or length(p_envelope->>'ciphertext') not between 4 and 7000
 or coalesce(p_card_fingerprint,'') !~ '^[a-f0-9]{64}$' or coalesce(p_key_id,'') !~ '^[A-Za-z0-9:_/-]{1,100}$' or coalesce(p_last4,'') !~ '^[0-9]{4}$'
 then raise exception 'Invalid encrypted card envelope' using errcode='22023';end if;
 -- Canonical functions acquire locks/budgets and preserve price/funnel rules.
 if p_funnel_token is null then result=home_ready.submit_website_inquiry(p_key,p_fingerprint,p_request,p_attribution,p_session,p_network);
 else result=home_ready.submit_credit_funnel_enrollment(p_funnel_token,p_key,p_fingerprint,p_request,p_attribution,p_session,p_network);end if;
 if result->>'allowed' is distinct from 'true' then return result;end if;
 select * into enrollment from home_ready.enrollments where id=(result->>'request_id')::uuid for update;
 if not found or enrollment.submission_key is distinct from p_key or enrollment.enrollment_source is distinct from 'website_manual' then raise exception 'Enrollment card context changed' using errcode='PT409';end if;
 select * into saved from home_ready.enrollment_card_vault where enrollment_id=enrollment.id;
 if found then
  if saved.submission_key<>p_key or saved.card_fingerprint<>p_card_fingerprint then raise exception 'Saved card details changed; original enrollment remains saved' using errcode='PT409';end if;
  return result||jsonb_build_object('card_saved',true);
 end if;
 if result->>'replayed'='true' then raise exception 'Existing enrollment has no card; historical card attachment is disabled' using errcode='PT409';end if;
 insert into home_ready.enrollment_card_vault(enrollment_id,submission_key,envelope,key_id,card_fingerprint,last4) values(enrollment.id,p_key,p_envelope,p_key_id,p_card_fingerprint,p_last4);
 return result||jsonb_build_object('card_saved',true);
end $$;
revoke all on function home_ready.save_enrollment_card(uuid,text,jsonb,jsonb,uuid,text,jsonb,text,text,text,text) from public,anon,authenticated;
grant execute on function home_ready.save_enrollment_card(uuid,text,jsonb,jsonb,uuid,text,jsonb,text,text,text,text) to service_role;

create function home_ready.read_enrollment_card(p_id uuid,p_actor uuid) returns jsonb
language plpgsql security invoker set search_path=pg_catalog as $$
declare stored home_ready.enrollment_card_vault%rowtype;
begin
 perform 1 from home_ready.team_members where id=p_actor and role='admin' for share;
 if not found then raise exception 'An authorized administrator is required' using errcode='42501';end if;
 select v.* into stored from home_ready.enrollment_card_vault v join home_ready.enrollments e on e.id=v.enrollment_id and e.submission_key=v.submission_key where v.enrollment_id=p_id and e.enrollment_source='website_manual';
 if not found then raise exception 'Saved card unavailable' using errcode='PT404';end if;
 -- This authorizes a server-side reveal attempt; it does not assert decrypted/viewed success.
 insert into home_ready.enrollment_card_access_audit(enrollment_id,actor_id,action) values(stored.enrollment_id,p_actor,'reveal_authorized');
 return jsonb_build_object('enrollment_id',stored.enrollment_id,'submission_key',stored.submission_key,'envelope',stored.envelope,'key_id',stored.key_id,'last4',stored.last4);
end $$;
revoke all on function home_ready.read_enrollment_card(uuid,uuid) from public,anon,authenticated;
grant execute on function home_ready.read_enrollment_card(uuid,uuid) to service_role;
