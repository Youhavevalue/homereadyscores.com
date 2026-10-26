-- Unapplied preparation. Metadata never returns ciphertext, PAN, factor secret or a proof.
create function home_ready.enrollment_card_metadata(p_id uuid,p_actor uuid) returns jsonb language plpgsql security invoker set search_path=pg_catalog as $$
declare tail text; configured boolean;
begin
 perform 1 from home_ready.team_members where id=p_actor and role='admin' for share;
 if not found then raise exception 'Current administrator access required' using errcode='42501';end if;
 perform 1 from home_ready.enrollments where id=p_id and enrollment_source='website_manual';
 if not found then raise exception 'Enrollment unavailable' using errcode='PT404';end if;
 select v.last4 into tail from home_ready.enrollment_card_vault v join home_ready.enrollments e on e.id=v.enrollment_id and e.submission_key=v.submission_key where v.enrollment_id=p_id;
 select exists(select 1 from home_ready.staff_card_mfa where member_id=p_actor and confirmed_at is not null) into configured;
 return jsonb_build_object('cardSaved',tail is not null,'last4',coalesce(tail,''),'factorConfigured',configured);
end $$;
revoke all on function home_ready.enrollment_card_metadata(uuid,uuid) from public,anon,authenticated,service_role;
grant execute on function home_ready.enrollment_card_metadata(uuid,uuid) to service_role;
