-- Every uploaded logo gets its own id, so its address (/cdn/<user>/<page>/<image>) changes with the file
-- and can be cached for good.
alter table public.custom_pages
  add column logo_light_id text,
  add column logo_dark_id text;

update public.custom_pages
  set logo_light_id = substr(replace(gen_random_uuid()::text, '-', ''), 1, 20)
  where logo_light is not null;

update public.custom_pages
  set logo_dark_id = substr(replace(gen_random_uuid()::text, '-', ''), 1, 20)
  where logo_dark is not null;
