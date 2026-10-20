alter table public.webhooks drop column if exists events;

create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public."user" (id) on delete cascade,
  server_id uuid not null references public.api_keys (id) on delete cascade,
  server_name text not null,
  fingerprint text not null,
  summary_encrypted text not null,
  content_encrypted text not null,
  occurrences integer not null default 1 check (occurrences >= 1),
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  expires_at timestamptz not null,
  unique (server_id, fingerprint)
);

create index alerts_user_last_seen_idx on public.alerts (user_id, last_seen_at desc);
create index alerts_expires_at_idx on public.alerts (expires_at);

alter table public.alerts enable row level security;
revoke all on public.alerts from anon, authenticated;

comment on table public.alerts is 'Errors a server reported. The same error on the same server is one row with a counter. Text is encrypted, rows expire after 14 days and each account keeps at most 100.';

select cron.schedule(
  'delete-expired-alerts',
  '*/15 * * * *',
  $$delete from public.alerts where expires_at < now()$$
);
