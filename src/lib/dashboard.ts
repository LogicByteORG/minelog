import { headers } from "next/headers";
import { auth } from "./auth";
import { AUTH_PROVIDERS, type AuthProvider } from "./auth-providers";
import { db } from "./db";
import { KIND_LABEL, type LogKind } from "./log";

export type OwnedLog = {
  id: string;
  isPrivate: boolean;
  typeLabel: string;
  lineCount: number;
  errorCount: number;
  warnCount: number;
  createdAt: Date;
  expiresAt: Date;
};

export type LogSummary = {
  active: number;
  withErrors: number;
  expiringSoon: number;
};

export type DayActivity = {
  day: string;
  total: number;
  withErrors: number;
};

export type LinkedAccount = {
  provider: AuthProvider;
  connectedAt: Date;
};

export const EXPIRING_SOON_DAYS = 7;

export const ACTIVITY_DAYS = 30;

type OwnedRow = Omit<OwnedLog, "typeLabel"> & { kind: LogKind };

export async function ownedLogs(userId: string, limit: number): Promise<OwnedLog[]> {
  const rows = await db()<OwnedRow[]>`
    select id, is_private, kind, line_count, error_count, warn_count, created_at, expires_at
    from public.logs
    where user_id = ${userId} and expires_at > now()
    order by created_at desc
    limit ${limit}
  `;
  return rows.map(({ kind, ...rest }) => ({ ...rest, typeLabel: KIND_LABEL[kind] }));
}

export async function logSummary(userId: string): Promise<LogSummary> {
  const [row] = await db()<LogSummary[]>`
    select
      count(*)::int as active,
      (count(*) filter (where error_count > 0))::int as with_errors,
      (count(*) filter (where expires_at < now() + make_interval(days => ${EXPIRING_SOON_DAYS})))::int as expiring_soon
    from public.logs
    where user_id = ${userId} and expires_at > now()
  `;
  return row ?? { active: 0, withErrors: 0, expiringSoon: 0 };
}

export async function logActivity(userId: string): Promise<DayActivity[]> {
  return db()<DayActivity[]>`
    select
      to_char(days.day, 'YYYY-MM-DD') as day,
      count(logs.id)::int as total,
      (count(logs.id) filter (where logs.error_count > 0))::int as with_errors
    from generate_series(
      (now() at time zone 'utc')::date - ${ACTIVITY_DAYS - 1}::int,
      (now() at time zone 'utc')::date,
      interval '1 day'
    ) as days(day)
    left join public.logs logs
      on logs.user_id = ${userId}
      and logs.expires_at > now()
      and (logs.created_at at time zone 'utc')::date = days.day::date
    group by days.day
    order by days.day
  `;
}

export async function isOwnedLog(id: string, userId: string): Promise<boolean> {
  const rows = await db()<{ id: string }[]>`
    select id from public.logs
    where id = ${id} and user_id = ${userId} and expires_at > now()
  `;
  return rows.length > 0;
}

export async function removeOwnedLog(id: string, userId: string): Promise<boolean> {
  const rows = await db()<{ id: string }[]>`
    delete from public.logs
    where id = ${id} and user_id = ${userId}
    returning id
  `;
  return rows.length > 0;
}

export async function linkedAccounts(): Promise<LinkedAccount[]> {
  const accounts = await auth.api.listUserAccounts({ headers: await headers() });
  const linked: LinkedAccount[] = [];
  for (const account of accounts) {
    const provider = AUTH_PROVIDERS.find((item) => item.id === account.providerId);
    if (provider) linked.push({ provider, connectedAt: new Date(account.createdAt) });
  }
  return linked;
}
