alter table public.logs drop constraint if exists logs_kind_check;

alter table public.logs add constraint logs_kind_check check (
  kind in (
    'server', 'client', 'crash', 'jvm',
    'yaml', 'toml', 'props', 'json',
    'unknown'
  )
);

