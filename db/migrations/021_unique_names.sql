-- One name per server and per webhook, ignoring case. Old duplicates get a number first.
with ranked as (
  select id, name, row_number() over (partition by user_id, lower(name) order by created_at) as n
  from public.api_keys
  where revoked_at is null
)
update public.api_keys k
set name = left(r.name, 36) || ' ' || r.n
from ranked r
where k.id = r.id and r.n > 1;

with ranked as (
  select id, name, row_number() over (partition by user_id, lower(name) order by created_at) as n
  from public.webhooks
)
update public.webhooks w
set name = left(r.name, 36) || ' ' || r.n
from ranked r
where w.id = r.id and r.n > 1;

create unique index api_keys_user_name_key on public.api_keys (user_id, lower(name)) where revoked_at is null;

create unique index webhooks_user_name_key on public.webhooks (user_id, lower(name));
