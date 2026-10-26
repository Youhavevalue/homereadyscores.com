-- Verify app/environment/project/schema before remote apply; additive live-release candidate.
-- Additive; existing manual inquiry and portal contracts remain in place.
-- Preserve canonical helper signature/grants; add only the new public funnel path.
CREATE OR REPLACE FUNCTION home_ready.valid_website_attribution(p_value jsonb)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'pg_catalog'
AS $function$
 SELECT p_value IS NOT NULL AND jsonb_typeof(p_value)='object' AND octet_length(p_value::text)<=1024
 AND NOT EXISTS(SELECT 1 FROM jsonb_each(p_value) e WHERE e.key NOT IN('utm_source','utm_medium','utm_campaign','landing_path','referrer_host','traffic_type') OR jsonb_typeof(e.value)<>'string'
 OR (e.key='utm_source' AND (e.value#>>'{}') NOT IN('google','bing','facebook','instagram','linkedin','youtube','tiktok','email','direct','website-qa','other'))
 OR (e.key='utm_medium' AND (e.value#>>'{}') NOT IN('organic','social','referral','email','paid-social','cpc','manual','none','other'))
 OR (e.key='utm_campaign' AND (e.value#>>'{}') NOT IN('readiness-qa','unregistered'))
 OR (e.key='traffic_type' AND (e.value#>>'{}') NOT IN('internal','qa'))
 OR (e.key='landing_path' AND (e.value#>>'{}') NOT IN('/','/how-it-works','/reviews','/get-started','/credit-help','/faq','/privacy-policy','/terms-of-service','/fcra-rights','/croa-disclosure'))
 OR (e.key='referrer_host' AND (e.value#>>'{}') NOT IN('google.com','bing.com','facebook.com','instagram.com','linkedin.com','t.co','youtube.com','yahoo.com','duckduckgo.com','other')));
$function$;

-- Preserve canonical event validation/dedup/grants; add only the new route.
CREATE OR REPLACE FUNCTION home_ready.record_website_event(p_session uuid, p_action text, p_path text, p_attribution jsonb, p_network text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE t timestamptz:=clock_timestamp();
BEGIN
 IF p_session IS NULL OR coalesce(p_action,'') NOT IN('visit','inquiry_opened','information_completed','goal_selected','submission_attempt','submission_error','confirmation_viewed') OR coalesce(p_path,'') NOT IN('/','/how-it-works','/reviews','/get-started','/credit-help','/faq','/privacy-policy','/terms-of-service','/fcra-rights','/croa-disclosure','/thank-you') OR NOT home_ready.valid_website_attribution(p_attribution) THEN RAISE EXCEPTION 'Invalid website event' USING ERRCODE='22023'; END IF;
 IF NOT home_ready.consume_website_budget(p_network,p_session,'event') THEN RETURN jsonb_build_object('allowed',false,'recorded',false,'retry_after_seconds',900); END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('hrs:event:'||p_session::text||':'||p_action||':'||p_path||':'||date_trunc('day',t)::text,0));
 IF EXISTS(SELECT 1 FROM home_ready.activity_log WHERE entity_type='website_session' AND entity_id=p_session AND action=p_action AND metadata->>'path'=p_path AND created_at>=date_trunc('day',t)) THEN RETURN jsonb_build_object('allowed',true,'recorded',false); END IF;
 INSERT INTO home_ready.activity_log(entity_type,entity_id,action,actor_type,metadata,created_at) VALUES('website_session',p_session,p_action,'visitor',jsonb_build_object('path',p_path,'attribution',p_attribution),t);
 RETURN jsonb_build_object('allowed',true,'recorded',true);
END $function$;

create table home_ready.credit_funnel_leads (
 id uuid primary key default gen_random_uuid(), submission_key uuid not null unique,
 token_hash text not null unique check(token_hash ~ '^[a-f0-9]{64}$'),
 session_id uuid not null, details jsonb not null check(jsonb_typeof(details)='object' and octet_length(details::text)<2048),
 attribution jsonb not null default '{}',
 stage text not null default 'contact_saved' check(stage in ('contact_saved','questionnaire_complete','enrollment_started','consultation_requested','enrollment_submitted')),
 enrollment_id uuid unique references home_ready.enrollments(id),
 assigned_to text not null default 'Ashley', review_status text not null default 'open' check(review_status in ('open','contact_attempted','closed')),
 review_notes text not null default '' check(length(review_notes)<=1000),
 consent_at timestamptz not null default clock_timestamp(), created_at timestamptz not null default clock_timestamp(), updated_at timestamptz not null default clock_timestamp(),
 access_expires_at timestamptz not null default clock_timestamp()+interval '7 days',
 internal boolean not null default false
);
create index credit_funnel_queue on home_ready.credit_funnel_leads(review_status,created_at desc);
create table home_ready.credit_funnel_events (
 id bigint generated always as identity primary key, session_id uuid not null,
 event text not null check(event in ('landing_view','first_answer','goal_completed','concern_completed','score_completed','contact_saved','bridge_viewed','enrollment_started','consultation_requested','enrollment_submitted')),
 internal boolean not null default false, created_at timestamptz not null default clock_timestamp(), unique(session_id,event)
);
alter table home_ready.credit_funnel_leads enable row level security;
alter table home_ready.credit_funnel_events enable row level security;
revoke all on home_ready.credit_funnel_leads, home_ready.credit_funnel_events from public,anon,authenticated;
grant select,insert,update,delete on home_ready.credit_funnel_leads,home_ready.credit_funnel_events to service_role;
revoke all on sequence home_ready.credit_funnel_events_id_seq from public,anon,authenticated;
grant usage,select on sequence home_ready.credit_funnel_events_id_seq to service_role;

create function home_ready.credit_funnel_dispatch(p_action text,p_token text,p_payload jsonb default '{}') returns jsonb
language plpgsql security invoker set search_path=pg_catalog as $$
declare r home_ready.credit_funnel_leads%rowtype; ev text; d jsonb; counts jsonb; metrics jsonb;
begin
 if jsonb_typeof(p_payload)<>'object' or octet_length(p_payload::text)>4096 then raise exception 'Invalid payload' using errcode='22023';end if;
 if p_action='event' then
  if p_payload->>'event' not in ('landing_view','first_answer','goal_completed','concern_completed','score_completed') then raise exception 'Invalid event' using errcode='22023';end if;
  if not home_ready.consume_website_budget(p_payload->>'network',(p_payload->>'sessionId')::uuid,'event') then raise exception 'Too many events' using errcode='22023';end if;
  insert into home_ready.credit_funnel_events(session_id,event,internal) values((p_payload->>'sessionId')::uuid,p_payload->>'event',coalesce((p_payload->>'internal')::boolean,false)) on conflict do nothing;
  return '{}';
 end if;
 if p_action='staffList' then
  select coalesce(jsonb_agg(to_jsonb(q)-'token_hash'-'submission_key'-'access_expires_at'),'[]') into d from (select * from home_ready.credit_funnel_leads order by created_at desc,id desc limit 100 offset (greatest(1,least(10000,coalesce((p_payload->>'page')::int,1)))-1)*100) q;
  select jsonb_object_agg(stages.stage,coalesce(actual.n,0)) into counts from (values ('contact_saved'),('questionnaire_complete'),('enrollment_started'),('consultation_requested'),('enrollment_submitted')) stages(stage) left join (select stage,count(*) n from home_ready.credit_funnel_leads where not internal group by stage) actual using(stage);
  select coalesce(jsonb_object_agg(event,n),'{}') into metrics from (select e.event,count(distinct e.session_id) n from home_ready.credit_funnel_events e where not e.internal and e.session_id in (select session_id from home_ready.credit_funnel_events where event='landing_view' and not internal and created_at>=clock_timestamp()-interval '30 days') group by e.event) q;
  return jsonb_build_object('leads',d,'counts',counts,'metrics',metrics,'windowDays',30,'metricMode','landing_cohort_30d','checkedAt',clock_timestamp(),'page',coalesce((p_payload->>'page')::int,1),'total',(select count(*) from home_ready.credit_funnel_leads),'hasMore',(select count(*)>coalesce((p_payload->>'page')::int,1)*100 from home_ready.credit_funnel_leads));
 end if;
 if p_action='staffUpdate' then
  update home_ready.credit_funnel_leads set review_status=p_payload->>'status',review_notes=p_payload->>'notes',updated_at=clock_timestamp() where id=(p_payload->>'id')::uuid and updated_at=(p_payload->>'expectedUpdatedAt')::timestamptz returning * into r;
  if not found then raise exception 'Revision changed' using errcode='PT409';end if;
  insert into home_ready.activity_log(entity_type,entity_id,action,actor_type,metadata,created_at) values('credit_funnel_lead',r.id,'review_updated','staff',jsonb_build_object('actor_id',p_payload->>'actor','review_status',r.review_status),clock_timestamp());
  return to_jsonb(r)-'token_hash'-'submission_key'-'access_expires_at';
 end if;
 if p_token is null or p_token !~ '^[a-f0-9]{64}$' then raise exception 'Not found' using errcode='PT404';end if;
 if p_action='saveContact' then
  perform pg_advisory_xact_lock(hashtextextended('hrs:funnel:'||(p_payload->>'submissionKey'),0));
  select * into r from home_ready.credit_funnel_leads where submission_key=(p_payload->>'submissionKey')::uuid;
  d=p_payload-'submissionKey'-'sessionId'-'attribution'-'network';
  if found then
   if r.token_hash<>p_token or r.details<>d then raise exception 'Save context changed' using errcode='PT409';end if;
   if r.access_expires_at<=clock_timestamp() then raise exception 'Expired' using errcode='PT404';end if;
   return to_jsonb(r);
  end if;
  if (select count(*) from home_ready.credit_funnel_leads where session_id=(p_payload->>'sessionId')::uuid and created_at>clock_timestamp()-interval '1 hour')>=5 then raise exception 'Too many requests' using errcode='22023';end if;
  if not home_ready.consume_website_budget(p_payload->>'network',(p_payload->>'sessionId')::uuid,'submit') then raise exception 'Too many requests' using errcode='22023';end if;
  insert into home_ready.credit_funnel_leads(submission_key,token_hash,session_id,details,attribution,internal) values((p_payload->>'submissionKey')::uuid,p_token,(p_payload->>'sessionId')::uuid,d,coalesce(p_payload->'attribution','{}'),coalesce(p_payload->'attribution'->>'traffic_type','') in ('qa','internal')) returning * into r;
  if r.internal then update home_ready.credit_funnel_events set internal=true where session_id=r.session_id;end if;
  ev='contact_saved';
 else
  select * into r from home_ready.credit_funnel_leads where token_hash=p_token and access_expires_at>clock_timestamp() for update;
  if not found then raise exception 'Not found' using errcode='PT404';end if;
  if p_action='get' then return to_jsonb(r);end if;
  if r.enrollment_id is not null and p_action not in ('bridgeViewed','startEnrollment') then raise exception 'Already submitted' using errcode='PT409';end if;
  if p_action in ('updateAnswers','updateContact') then update home_ready.credit_funnel_leads set details=details||p_payload,updated_at=clock_timestamp() where id=r.id returning * into r;
  elsif p_action='bridgeViewed' then ev='bridge_viewed';update home_ready.credit_funnel_leads set stage=case when stage='contact_saved' then 'questionnaire_complete' else stage end,updated_at=clock_timestamp() where id=r.id returning * into r;
  elsif p_action='startEnrollment' then ev='enrollment_started';update home_ready.credit_funnel_leads set stage=case when enrollment_id is null then 'enrollment_started' else stage end,updated_at=clock_timestamp() where id=r.id returning * into r;
  elsif p_action='consultation' then ev='consultation_requested';update home_ready.credit_funnel_leads set stage='consultation_requested',updated_at=clock_timestamp() where id=r.id returning * into r;
  else raise exception 'Invalid action' using errcode='22023';end if;
 end if;
 if ev is not null then insert into home_ready.credit_funnel_events(session_id,event,internal) values(r.session_id,ev,r.internal) on conflict do nothing;end if;
 return to_jsonb(r);
end $$;
revoke all on function home_ready.credit_funnel_dispatch(text,text,jsonb) from public,anon,authenticated;
grant execute on function home_ready.credit_funnel_dispatch(text,text,jsonb) to service_role;

create function home_ready.submit_credit_funnel_enrollment(p_token text,p_key uuid,p_fingerprint text,p_request jsonb,p_attribution jsonb,p_session uuid,p_network text) returns jsonb
language plpgsql security invoker set search_path=pg_catalog as $$
declare r home_ready.credit_funnel_leads%rowtype; result jsonb;
begin
 select * into r from home_ready.credit_funnel_leads where token_hash=p_token and access_expires_at>clock_timestamp() for update;
 if not found then raise exception 'Saved lead unavailable' using errcode='PT404';end if;
 if lower(p_request->>'email')<>r.details->>'email' or p_request->>'first_name'<>r.details->>'firstName' or p_request->>'last_name'<>r.details->>'lastName' or coalesce(p_request->>'phone','')<>coalesce(r.details->>'phone','') then raise exception 'Confirm edited contact first' using errcode='PT409';end if;
 if r.enrollment_id is not null then
  if exists(select 1 from home_ready.enrollments where id=r.enrollment_id and submission_fingerprint=p_fingerprint) then return jsonb_build_object('allowed',true,'request_id',r.enrollment_id,'replayed',true);end if;
  raise exception 'Request already submitted with different details' using errcode='PT409';
 end if;
 -- Reuse existing canonical insertion, price and idempotence rules in the same transaction.
 result=home_ready.submit_website_inquiry(p_key,p_fingerprint,p_request,r.attribution,r.session_id,p_network);
 if result->>'allowed'='true' and result->>'request_id' is not null then
  if exists(select 1 from home_ready.credit_funnel_leads where enrollment_id=(result->>'request_id')::uuid and id<>r.id) then raise exception 'Request already linked' using errcode='PT409';end if;
  update home_ready.credit_funnel_leads set enrollment_id=(result->>'request_id')::uuid,stage='enrollment_submitted',updated_at=clock_timestamp() where id=r.id;
  insert into home_ready.credit_funnel_events(session_id,event,internal) values(r.session_id,'enrollment_submitted',r.internal) on conflict do nothing;
 end if;
 return result;
end $$;
revoke all on function home_ready.submit_credit_funnel_enrollment(text,uuid,text,jsonb,jsonb,uuid,text) from public,anon,authenticated;
grant execute on function home_ready.submit_credit_funnel_enrollment(text,uuid,text,jsonb,jsonb,uuid,text) to service_role;
