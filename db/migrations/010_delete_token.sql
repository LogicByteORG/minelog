alter table public.logs
  add column if not exists delete_token_hash text
  check (delete_token_hash is null or char_length(delete_token_hash) = 64);

