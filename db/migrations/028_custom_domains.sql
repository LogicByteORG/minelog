alter table public.custom_pages
  add column custom_domain text check (custom_domain = lower(custom_domain) and length(custom_domain) <= 253),
  add column domain_added_at timestamptz,
  add column domain_verified_at timestamptz;

create unique index custom_pages_custom_domain_idx on public.custom_pages (custom_domain)
  where custom_domain is not null;

comment on column public.custom_pages.custom_domain is 'A subdomain the owner points at minelog, for example logs.example.com. Served only once domain_verified_at is set.';
