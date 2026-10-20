alter table public.logs
  add column if not exists user_id text references public."user" (id) on delete set null;

create index if not exists logs_user_id_created_at_idx
  on public.logs (user_id, created_at desc)
  where user_id is not null;

comment on column public.logs.user_id is 'The signed-in user who saved the log from the website. Null for anonymous logs. Set to null if the user is deleted.';
