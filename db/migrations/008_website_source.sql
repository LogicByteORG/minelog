update public.logs
set source = 'Website'
where source in ('web', 'minelog.org');

