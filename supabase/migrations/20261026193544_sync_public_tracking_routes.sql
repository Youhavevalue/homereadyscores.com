-- Keep database tracking validation aligned with published route metadata.
-- Existing event validation, deduplication, rate limits and grants are preserved.
CREATE OR REPLACE FUNCTION home_ready.record_website_event(p_session uuid, p_action text, p_path text, p_attribution jsonb, p_network text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE t timestamptz:=clock_timestamp();
BEGIN
 IF p_session IS NULL OR coalesce(p_action,'') NOT IN('visit','inquiry_opened','information_completed','goal_selected','submission_attempt','submission_error','confirmation_viewed') OR coalesce(p_path,'') NOT IN('/','/how-it-works','/reviews','/articles','/resources','/get-your-credit-score','/client-login','/get-started','/credit-help','/faq','/privacy-policy','/terms-of-service','/fcra-rights','/croa-disclosure','/articles/check-credit-report-for-errors','/articles/credit-card-balances-payment-habits','/articles/prepare-credit-for-home-loan','/thank-you') OR NOT home_ready.valid_website_attribution(p_attribution) THEN RAISE EXCEPTION 'Invalid website event' USING ERRCODE='22023'; END IF;
 IF NOT home_ready.consume_website_budget(p_network,p_session,'event') THEN RETURN jsonb_build_object('allowed',false,'recorded',false,'retry_after_seconds',900); END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('hrs:event:'||p_session::text||':'||p_action||':'||p_path||':'||date_trunc('day',t)::text,0));
 IF EXISTS(SELECT 1 FROM home_ready.activity_log WHERE entity_type='website_session' AND entity_id=p_session AND action=p_action AND metadata->>'path'=p_path AND created_at>=date_trunc('day',t)) THEN RETURN jsonb_build_object('allowed',true,'recorded',false); END IF;
 INSERT INTO home_ready.activity_log(entity_type,entity_id,action,actor_type,metadata,created_at) VALUES('website_session',p_session,p_action,'visitor',jsonb_build_object('path',p_path,'attribution',p_attribution),t);
 RETURN jsonb_build_object('allowed',true,'recorded',true);
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
 OR (e.key='landing_path' AND (e.value#>>'{}') NOT IN('/','/how-it-works','/reviews','/articles','/resources','/get-your-credit-score','/client-login','/get-started','/credit-help','/faq','/privacy-policy','/terms-of-service','/fcra-rights','/croa-disclosure','/articles/check-credit-report-for-errors','/articles/credit-card-balances-payment-habits','/articles/prepare-credit-for-home-loan'))
 OR (e.key='referrer_host' AND (e.value#>>'{}') NOT IN('google.com','bing.com','facebook.com','instagram.com','linkedin.com','t.co','youtube.com','yahoo.com','duckduckgo.com','other')));
$function$;
