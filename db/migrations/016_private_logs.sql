alter table public.logs
  add column if not exists is_private boolean not null default false;

comment on column public.logs.is_private is 'True for logs only the owner can open, at /p/<id>, while signed in. Never served by the public site pages or the API.';
