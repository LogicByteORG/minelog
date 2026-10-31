alter table public.custom_pages alter column name drop not null;

comment on column public.custom_pages.name is 'Optional. Shown in the tab title and in place of the logo when there is none.';
