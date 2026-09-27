create extension if not exists pg_cron;

select cron.schedule(
  'delete-expired-logs',
  '17 * * * *',
  $$delete from public.logs where expires_at < now()$$
);

