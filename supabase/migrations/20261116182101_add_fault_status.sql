alter table public.faults
  add column status text not null default 'registered'
  constraint faults_status_check check (status in ('registered', 'resolved'));
