alter table public.logs
  add column if not exists source text
  check (source is null or char_length(source) <= 32);

