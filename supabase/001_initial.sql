begin;

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (length(btrim(name)) > 0)
);

create table public.faults (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  title text not null check (length(btrim(title)) > 0),
  priority text not null default 'normal' check (priority in ('normal', 'high'))
);

create index rooms_user_id_idx on public.rooms(user_id);
create index faults_room_id_idx on public.faults(room_id);

alter table public.rooms enable row level security;
alter table public.faults enable row level security;

revoke all on public.rooms, public.faults from anon, authenticated;
grant select, insert, update, delete on public.rooms, public.faults to authenticated;

create policy own_rooms on public.rooms
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy own_room_faults on public.faults
  for all to authenticated
  using (exists (
    select 1 from public.rooms
    where rooms.id = faults.room_id and rooms.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.rooms
    where rooms.id = faults.room_id and rooms.user_id = (select auth.uid())
  ));

commit;

