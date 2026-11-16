-- Adds readable room and priority names to the existing webhook payload.
-- The destination stays in the trigger arguments, outside this repository.
create schema if not exists private;

create or replace function private.notify_fault_insert()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  room_name text;
begin
  select r.name into strict room_name
  from public.rooms r where r.id = new.room_id;

  perform net.http_post(
    url := tg_argv[0],
    headers := '{"Content-Type":"application/json"}'::jsonb,
    body := jsonb_build_object(
      'type', tg_op,
      'table', tg_table_name,
      'schema', tg_table_schema,
      'record', to_jsonb(new) || jsonb_build_object(
        'room_name', room_name,
        'priority_name', case when new.priority = 'high' then 'Skubus' else 'Įprastas' end
      )
    ),
    timeout_milliseconds := 5000
  );
  return new;
end;
$$;

revoke all on function private.notify_fault_insert() from public, anon, authenticated;

-- Preserve the already configured URL when replacing the standard webhook.
do $$
declare
  trigger_sql text;
begin
  select pg_get_triggerdef(t.oid) into trigger_sql
  from pg_trigger t
  where t.tgrelid = 'public.faults'::regclass
    and t.tgname = 'faults_zapier_insert'
    and not t.tgisinternal;

  if trigger_sql like '%supabase_functions.http_request%' then
    execute 'drop trigger faults_zapier_insert on public.faults';
    execute replace(trigger_sql, 'supabase_functions.http_request', 'private.notify_fault_insert');
  end if;
end;
$$;
