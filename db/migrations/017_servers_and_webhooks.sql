create table public.api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public."user" (id) on delete cascade,
  name text not null,
  name_is_custom boolean not null default false,
  key_hash text not null unique,
  key_prefix text not null,
  software text,
  software_version text,
  plugin_version text,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz,
  revoked_at timestamptz
);

create index api_keys_user_id_idx on public.api_keys (user_id) where revoked_at is null;

create table public.webhooks (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public."user" (id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('discord', 'slack', 'custom')),
  url_encrypted text not null,
  url_hint text not null,
  events text[] not null,
  enabled boolean not null default true,
  failure_count integer not null default 0,
  last_status text check (last_status in ('ok', 'failed')),
  last_attempt_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);

create index webhooks_user_id_idx on public.webhooks (user_id, created_at);

alter table public.api_keys enable row level security;
alter table public.webhooks enable row level security;

revoke all on public.api_keys from anon, authenticated;
revoke all on public.webhooks from anon, authenticated;

comment on table public.api_keys is 'One key per connected Minecraft server. Only the sha256 hash of the key is stored.';
comment on table public.webhooks is 'Where a user wants server alerts sent. The URL is encrypted, url_hint is the safe-to-show version.';
