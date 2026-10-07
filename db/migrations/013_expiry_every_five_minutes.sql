-- Expired logs were only removed once an hour, so a log meant to live for one
-- hour (preview builds) or 48 hours (saved without hiding private details)
-- could stay in the table for up to an hour longer than promised. Reads already
-- ignore expired rows; this makes the physical delete follow quickly too.
select cron.schedule(
  'delete-expired-logs',
  '*/5 * * * *',
  $$delete from public.logs where expires_at < now()$$
);
