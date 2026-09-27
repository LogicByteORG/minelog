create table public.heartbeat (
  category text primary key,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.heartbeat enable row level security;
revoke all on public.heartbeat from anon, authenticated;

comment on table public.heartbeat is 'One row that appears and disappears on a schedule, so the database always sees activity.';
