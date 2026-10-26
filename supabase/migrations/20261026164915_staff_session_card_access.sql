-- Current signed-in staff access only. No second password, reveal grant or timer.
create function home_ready.read_enrollment_card_for_staff(p_id uuid,p_actor uuid,p_version text) returns jsonb language plpgsql security invoker set search_path=pg_catalog as $$
declare stored home_ready.enrollment_card_vault%rowtype; code home_ready.enrollment_security_codes%rowtype; result jsonb;
begin
 perform 1 from home_ready.team_members where id=p_actor for share;
 if not home_ready.valid_card_staff(p_actor,p_version) then raise exception 'Current administrator access required' using errcode='42501';end if;
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

revoke all on function home_ready.read_enrollment_card_for_staff(uuid,uuid,text) from public,anon,authenticated;
grant execute on function home_ready.read_enrollment_card_for_staff(uuid,uuid,text) to service_role;

create function home_ready.modify_enrollment_security_code_for_staff(p_id uuid,p_actor uuid,p_version text,p_action text,p_envelope jsonb,p_key_id text) returns jsonb
language plpgsql security invoker set search_path=pg_catalog as $$
declare enrollment home_ready.enrollments%rowtype;
begin
 perform 1 from home_ready.team_members where id=p_actor for share;
 if not home_ready.valid_card_staff(p_actor,p_version) then raise exception 'Current administrator access required' using errcode='42501';end if;
 if p_action not in ('updateCVV','clearCVV') then raise exception 'Choose a valid card action' using errcode='22023';end if;
 select * into enrollment from home_ready.enrollments where id=p_id for update;
 if not found or not exists(select 1 from home_ready.enrollment_card_vault where enrollment_id=p_id and submission_key=enrollment.submission_key) then raise exception 'Saved card unavailable' using errcode='PT404';end if;
 if p_action='updateCVV' and (coalesce(enrollment.setup_fee_status,'pending')='paid' or exists(select 1 from home_ready.enrollment_security_code_events where enrollment_id=p_id and action='authorization_recorded')) then raise exception 'The initial payment is already recorded. Do not retain a security code after authorization.' using errcode='22023';end if;
 if p_action='updateCVV' and ((home_ready.enrollment_security_code_readiness()->>'ready') is distinct from 'true' or p_envelope is null or jsonb_typeof(p_envelope)<>'object' or p_envelope->>'v' is distinct from '1' or not(p_envelope ?& array['v','iv','tag','ciphertext']) or p_envelope-array['v','iv','tag','ciphertext','context']<>'{}'::jsonb or octet_length(p_envelope::text) not between 80 and 1024 or coalesce(p_key_id,'') !~ '^[A-Za-z0-9:_/-]{1,100}$') then raise exception 'Card update unavailable' using errcode='22023';end if;
 delete from home_ready.enrollment_security_codes where enrollment_id=p_id;
 if p_action='updateCVV' then insert into home_ready.enrollment_security_codes(enrollment_id,submission_key,envelope,key_id) values(p_id,enrollment.submission_key,p_envelope,p_key_id);end if;
 insert into home_ready.enrollment_security_code_events(enrollment_id,actor_id,action) values(p_id,p_actor,case when p_action='updateCVV' then 'updated' else 'authorization_recorded' end);
 return jsonb_build_object('success',true,'securityCodeSaved',p_action='updateCVV');
end $$;
revoke all on function home_ready.modify_enrollment_security_code_for_staff(uuid,uuid,text,text,jsonb,text) from public,anon,authenticated;
grant execute on function home_ready.modify_enrollment_security_code_for_staff(uuid,uuid,text,text,jsonb,text) to service_role;


create function home_ready.card_storage_staff_session_readiness() returns jsonb
language sql stable security invoker set search_path=pg_catalog as $$
select jsonb_build_object('ready',current_user='service_role'
 and (home_ready.card_storage_password_readiness()->>'ready')='true'
 and (home_ready.enrollment_security_code_readiness()->>'ready')='true'
 and to_regprocedure('home_ready.read_enrollment_card_for_staff(uuid,uuid,text)') is not null
 and to_regprocedure('home_ready.modify_enrollment_security_code_for_staff(uuid,uuid,text,text,jsonb,text)') is not null
 and not has_function_privilege('anon','home_ready.read_enrollment_card_for_staff(uuid,uuid,text)','EXECUTE')
 and not has_function_privilege('authenticated','home_ready.read_enrollment_card_for_staff(uuid,uuid,text)','EXECUTE'),
 'version','hrs-staff-session-card-v1');
$$;
revoke all on function home_ready.card_storage_staff_session_readiness() from public,anon,authenticated;
grant execute on function home_ready.card_storage_staff_session_readiness() to service_role;
