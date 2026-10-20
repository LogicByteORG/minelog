alter table public.webhooks
  add column handle text,
  add column server_ids uuid[];

with base as (
  select
    id,
    user_id,
    created_at,
    coalesce(
      nullif(trim(both '-' from left(trim(both '-' from lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))), 28)), ''),
      'webhook'
    ) as slug
  from public.webhooks
),
ranked as (
  select id, slug, row_number() over (partition by user_id, slug order by created_at, id) as rn
  from base
)
update public.webhooks w
set handle = case when r.rn = 1 then r.slug else r.slug || '-' || r.rn end
from ranked r
where r.id = w.id;

alter table public.webhooks alter column handle set not null;

alter table public.webhooks
  add constraint webhooks_handle_format
  check (handle ~ '^[a-z0-9](?:[a-z0-9-]{0,30}[a-z0-9])?$');

create unique index webhooks_user_handle_idx on public.webhooks (user_id, handle);

comment on column public.webhooks.handle is 'Short name scripts use to pick this webhook, unique per user.';
comment on column public.webhooks.server_ids is 'Servers that send to this webhook when a script names no target. Null means every server.';
