alter table public.webhooks drop constraint if exists webhooks_kind_check;

alter table public.webhooks add constraint webhooks_kind_check check (
  kind in ('discord', 'slack', 'teams', 'googlechat', 'telegram', 'guilded', 'mattermost', 'custom')
);
