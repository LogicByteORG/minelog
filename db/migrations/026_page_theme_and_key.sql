alter table public.custom_pages
  add column theme jsonb not null default '{}'::jsonb,
  add column api_key_hash text unique,
  add column api_key_prefix text,
  add column api_key_created_at timestamptz;

comment on column public.custom_pages.theme is 'Colors, button look and logo size the owner picked. Anything missing falls back to the minelog look.';
comment on column public.custom_pages.api_key_hash is 'sha256 of the page API key. The key itself is shown once and never stored.';
