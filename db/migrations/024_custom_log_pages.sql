create table public.custom_pages (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public."user" (id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9](?:[a-z0-9-]{1,30})[a-z0-9]$'),
  name text not null,
  logo_light bytea,
  logo_light_type text check (logo_light_type in ('image/png', 'image/jpeg', 'image/webp')),
  logo_dark bytea,
  logo_dark_type text check (logo_dark_type in ('image/png', 'image/jpeg', 'image/webp')),
  logo_url text,
  button_radius smallint not null default 0 check (button_radius between 0 and 24),
  features jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index custom_pages_user_id_idx on public.custom_pages (user_id, created_at);

alter table public.logs
  add column custom_page_id uuid references public.custom_pages (id) on delete set null;

create index logs_custom_page_id_idx on public.logs (custom_page_id) where custom_page_id is not null;

alter table public.custom_pages enable row level security;

revoke all on public.custom_pages from anon, authenticated;

comment on table public.custom_pages is 'A branded log page an account owns: logo, link, button corners and which features show. Logos live in the row, not in storage.';
