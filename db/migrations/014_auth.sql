create table public."user" (
  id text primary key,
  name text not null,
  email text not null unique,
  "emailVerified" boolean not null default false,
  image text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table public.session (
  id text primary key,
  "expiresAt" timestamptz not null,
  token text not null unique,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  "ipAddress" text,
  "userAgent" text,
  "userId" text not null references public."user" (id) on delete cascade
);

create index session_user_id_idx on public.session ("userId");

create table public.account (
  id text primary key,
  "accountId" text not null,
  "providerId" text not null,
  "userId" text not null references public."user" (id) on delete cascade,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamptz,
  "refreshTokenExpiresAt" timestamptz,
  scope text,
  password text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  unique ("providerId", "accountId")
);

create index account_user_id_idx on public.account ("userId");

create table public.verification (
  id text primary key,
  identifier text not null,
  value text not null,
  "expiresAt" timestamptz not null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index verification_identifier_idx on public.verification (identifier);

alter table public."user" enable row level security;
alter table public.session enable row level security;
alter table public.account enable row level security;
alter table public.verification enable row level security;

revoke all on public."user" from anon, authenticated;
revoke all on public.session from anon, authenticated;
revoke all on public.account from anon, authenticated;
revoke all on public.verification from anon, authenticated;

comment on table public."user" is 'People who signed in with GitHub or Discord.';
comment on table public.session is 'Signed-in browser sessions. Deleted with the user.';
comment on table public.account is 'The GitHub or Discord identity linked to a user, plus its OAuth tokens.';
comment on table public.verification is 'Short-lived OAuth state values used while a sign-in is in progress.';
