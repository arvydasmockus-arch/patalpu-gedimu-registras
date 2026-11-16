begin;
insert into auth.users(id,email) values ('10000000-0000-4000-8000-000000000001','rls-a@example.invalid'),('10000000-0000-4000-8000-000000000002','rls-b@example.invalid');
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
insert into public.rooms(id,name) values('20000000-0000-4000-8000-000000000001','RLS test A');
insert into public.faults(room_id,title,priority) values('20000000-0000-4000-8000-000000000001','RLS test fault','high');
do $$ begin if (select count(*) from public.rooms) <> 1 or (select count(*) from public.faults) <> 1 then raise exception 'Owner cannot see own rows'; end if; end $$;
do $$ begin
if (select status from public.faults limit 1) <> 'registered' then raise exception 'Wrong default status'; end if;
update public.faults set status='resolved' where room_id='20000000-0000-4000-8000-000000000001';
if not found then raise exception 'Owner cannot update status'; end if;
begin update public.faults set status='invalid'; raise exception 'Invalid status accepted'; exception when check_violation then null; end;
end $$;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',true);
do $$ begin
if exists(select 1 from public.rooms) or exists(select 1 from public.faults) then raise exception 'Cross-user data exposed'; end if;
begin insert into public.faults(room_id,title) values('20000000-0000-4000-8000-000000000001','Forbidden'); raise exception 'Foreign fault insert accepted'; exception when insufficient_privilege then null; end;
begin insert into public.rooms(user_id,name) values('10000000-0000-4000-8000-000000000001','Forbidden'); raise exception 'Foreign owner accepted'; exception when insufficient_privilege then null; end;
update public.rooms set name='Forbidden' where id='20000000-0000-4000-8000-000000000001';
if found then raise exception 'Foreign room updated'; end if;
update public.faults set status='registered' where room_id='20000000-0000-4000-8000-000000000001';
if found then raise exception 'Foreign status updated'; end if;
delete from public.faults where room_id='20000000-0000-4000-8000-000000000001';
if found then raise exception 'Foreign fault deleted'; end if;
end $$;
reset role;
do $$ begin if has_table_privilege('anon','public.rooms','SELECT') or has_table_privilege('anon','public.faults','INSERT') then raise exception 'Anonymous permissions granted'; end if; end $$;
select 'PASS: ownership, status default/update/check, cross-user SELECT/INSERT/UPDATE/DELETE, anon grants' as result;
rollback;
