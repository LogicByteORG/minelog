-- The sign-in a person marks as primary, and the last time they proved it is them with it.
create table public.account_security (
  user_id text primary key references public."user" (id) on delete cascade,
  primary_provider text check (primary_provider in ('github', 'discord')),
  verified_provider text check (verified_provider in ('github', 'discord')),
  verified_at timestamptz
);

alter table public.account_security enable row level security;

revoke all on public.account_security from anon, authenticated;

comment on table public.account_security is 'Which linked sign-in is primary, and when it was last used to confirm a sensitive change.';
