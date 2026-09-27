update public.logs
set expires_at = created_at + make_interval(days => 120)
where expires_at > now()
  and created_at + make_interval(days => 120) > expires_at;

