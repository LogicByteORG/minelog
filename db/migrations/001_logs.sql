create table public.logs (
  id text primary key check (id ~ '^[a-km-np-z2-9]{8}$'),

  content text compression lz4 not null,

  kind text not null check (kind in ('server', 'client', 'crash', 'jvm', 'unknown')),
  line_count integer not null check (line_count >= 0),
  byte_size integer not null check (byte_size >= 0),
  error_count integer not null default 0 check (error_count >= 0),
  warn_count integer not null default 0 check (warn_count >= 0),

  privacy_applied boolean not null default true,

  ip_hash text,

  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index logs_expires_at_idx on public.logs (expires_at);
create index logs_ip_hash_created_at_idx on public.logs (ip_hash, created_at);

alter table public.logs enable row level security;
revoke all on public.logs from anon, authenticated;

comment on table public.logs is 'Shared Minecraft logs. Deleted automatically after expires_at.';

