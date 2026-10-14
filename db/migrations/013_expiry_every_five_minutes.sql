select cron.schedule(
  'delete-expired-logs',
  '*/5 * * * *',
  $$delete from public.logs where expires_at < now()$$
);
