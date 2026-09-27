alter table public.logs drop constraint if exists logs_id_check;

alter table public.logs add constraint logs_id_check check (
  (
    length(id) = 9
    and id ~ '^[a-km-np-zA-HJ-KM-NP-Z2-9]{9}$'
    and id ~ '[a-km-np-z]'
    and id ~ '[A-HJ-KM-NP-Z]'
    and id ~ '[2-9]'
  ) or (
    length(id) = 8
    and id ~ '^[a-km-np-z2-9]{8}$'
  )
);

