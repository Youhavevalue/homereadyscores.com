CREATE OR REPLACE FUNCTION home_ready.consume_website_budget(p_network text, p_session uuid, p_kind text)
 RETURNS boolean
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE t timestamptz:=clock_timestamp(); b record; n integer; allowed boolean:=true;
BEGIN
 IF p_network IS NULL OR p_network !~ '^[a-f0-9]{64}$' OR p_session IS NULL OR coalesce(p_kind,'') NOT IN('event','submit') THEN RAISE EXCEPTION 'Invalid website budget' USING ERRCODE='22023'; END IF;
 DELETE FROM home_ready.website_rate_limits WHERE ctid IN(SELECT ctid FROM home_ready.website_rate_limits WHERE expires_at<t ORDER BY expires_at,key_hash,purpose,window_start LIMIT 200 FOR UPDATE SKIP LOCKED);
 FOR b IN SELECT * FROM (
  SELECT p_network AS key_hash,p_kind||'_network' AS purpose,
   CASE WHEN p_kind='event' THEN date_trunc('hour',t)+floor(extract(minute FROM t)/15)*interval '15 minutes' ELSE date_trunc('hour',t) END AS window_start,
   CASE WHEN p_kind='event' THEN 180 ELSE 20 END AS budget,
   CASE WHEN p_kind='event' THEN interval '15 minutes' ELSE interval '1 hour' END AS duration
  UNION ALL
  SELECT md5(p_session::text),p_kind||'_session',CASE WHEN p_kind='event' THEN date_trunc('day',t) ELSE date_trunc('hour',t) END,
   CASE WHEN p_kind='event' THEN 40 ELSE 5 END,CASE WHEN p_kind='event' THEN interval '1 day' ELSE interval '1 hour' END
 ) limits ORDER BY key_hash,purpose LOOP
  INSERT INTO home_ready.website_rate_limits AS existing(key_hash,purpose,window_start,attempts,expires_at)
   VALUES(b.key_hash,b.purpose,b.window_start,1,b.window_start+b.duration)
   ON CONFLICT(key_hash,purpose,window_start) DO UPDATE SET attempts=LEAST(existing.attempts+1,b.budget+1)
   RETURNING attempts INTO n;
  IF n>b.budget THEN allowed:=false; END IF;
 END LOOP;
 RETURN allowed;
END $function$;

CREATE OR REPLACE FUNCTION home_ready.submit_website_inquiry(p_key uuid, p_fingerprint text, p_request jsonb, p_attribution jsonb, p_session uuid, p_network text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE saved home_ready.enrollments%ROWTYPE; t timestamptz:=clock_timestamp();
BEGIN
 IF p_key IS NULL OR p_session IS NULL OR p_fingerprint IS NULL OR p_fingerprint !~ '^[a-f0-9]{64}$' OR jsonb_typeof(p_request) IS DISTINCT FROM 'object' OR octet_length(p_request::text)>2048 OR NOT home_ready.valid_website_attribution(p_attribution)
 OR EXISTS(SELECT 1 FROM jsonb_object_keys(p_request) k WHERE k NOT IN('first_name','last_name','email','phone','goal','plan','billing_zip','credit_report_agreement'))
 OR EXISTS(SELECT 1 FROM jsonb_each(p_request) e WHERE e.key<>'credit_report_agreement' AND jsonb_typeof(e.value)<>'string')
 OR length(coalesce(p_request->>'first_name','')) NOT BETWEEN 1 AND 100 OR length(coalesce(p_request->>'last_name','')) NOT BETWEEN 1 AND 100
 OR length(coalesce(p_request->>'email',''))>254 OR coalesce(p_request->>'email','') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
 OR coalesce(p_request->>'phone','') !~ '^[2-9][0-9]{2}[2-9][0-9]{6}$' OR coalesce(p_request->>'phone','') ~ '^([0-9])\1{9}$'
 OR coalesce(p_request->>'plan','') NOT IN('single','couple') OR coalesce(p_request->>'goal','') NOT IN('Buy a Home','Buy a Car','Refinance Loan','General Repair','Other')
 OR coalesce(p_request->>'billing_zip','') !~ '^[0-9]{5}$' OR p_request->'credit_report_agreement' IS DISTINCT FROM 'true'::jsonb THEN RAISE EXCEPTION 'Invalid inquiry' USING ERRCODE='22023'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('hrs:submission:'||p_key::text,0));
 SELECT * INTO saved FROM home_ready.enrollments WHERE submission_key=p_key;
 IF FOUND THEN
  IF saved.submission_fingerprint<>p_fingerprint THEN RAISE EXCEPTION 'Submission changed; use a new request key' USING ERRCODE='22023'; END IF;
  RETURN jsonb_build_object('allowed',true,'request_id',saved.id,'replayed',true);
 END IF;
 IF NOT home_ready.consume_website_budget(p_network,p_session,'submit') THEN RETURN jsonb_build_object('allowed',false,'retry_after_seconds',3600); END IF;
 INSERT INTO home_ready.enrollments(first_name,last_name,email,phone,goal,plan,billing_zip,credit_report_agreement,setup_fee_amount,monthly_amount,setup_fee_status,subscription_status,enrollment_source,status,assigned_to,next_action,submission_key,submission_fingerprint,website_session_id,attribution,created_at,updated_at)
 VALUES(p_request->>'first_name',p_request->>'last_name',p_request->>'email',p_request->>'phone',p_request->>'goal',p_request->>'plan',p_request->>'billing_zip',true,CASE WHEN p_request->>'plan'='single' THEN 18999 ELSE 37999 END,CASE WHEN p_request->>'plan'='single' THEN 10000 ELSE 16000 END,'not_collected','not_created','website_manual','pending_manual_review','Ashley','Review new inquiry',p_key,p_fingerprint,p_session,p_attribution,t,t) RETURNING * INTO saved;
 INSERT INTO home_ready.activity_log(entity_type,entity_id,action,actor_type,metadata,created_at) VALUES('website_session',p_session,'inquiry_saved','system',jsonb_build_object('path','/get-started','attribution',p_attribution),t);
 INSERT INTO home_ready.activity_log(entity_type,entity_id,action,actor_type,metadata,created_at) VALUES('enrollment',saved.id,'created','system',jsonb_build_object('status',saved.status,'assigned_to',saved.assigned_to),t);
 RETURN jsonb_build_object('allowed',true,'request_id',saved.id,'replayed',false);
END $function$;

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
 OR (e.key='landing_path' AND (e.value#>>'{}') NOT IN('/','/how-it-works','/reviews','/get-started','/faq','/privacy-policy','/terms-of-service','/fcra-rights','/croa-disclosure'))
 OR (e.key='referrer_host' AND (e.value#>>'{}') NOT IN('google.com','bing.com','facebook.com','instagram.com','linkedin.com','t.co','youtube.com','yahoo.com','duckduckgo.com','other')));
$function$;

