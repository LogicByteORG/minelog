import { ALERTS_PER_ACCOUNT, ALERT_RETENTION_DAYS } from "./config";
import { db } from "./db";
import { open, seal } from "./vault";

export type AlertRow = {
  id: string;
  serverId: string;
  serverName: string;
  summary: string;
  occurrences: number;
  firstSeenAt: Date;
  lastSeenAt: Date;
  expiresAt: Date;
};

export type AlertDetail = AlertRow & { content: string };

type StoredAlert = Omit<AlertRow, "summary"> & {
  summaryEncrypted: string;
  contentEncrypted?: string;
};

export type RecordedAlert = { id: string; occurrences: number; isNew: boolean };

function readable(sealed: string): string {
  try {
    return open(sealed);
  } catch {
    return "(this text can't be read anymore)";
  }
}

export async function recordAlert(input: {
  userId: string;
  serverId: string;
  serverName: string;
  fingerprint: string;
  summary: string;
  content: string;
}): Promise<RecordedAlert> {
  const [row] = await db()<{ id: string; occurrences: number; inserted: boolean }[]>`
    insert into public.alerts
      (user_id, server_id, server_name, fingerprint, summary_encrypted, content_encrypted, expires_at)
    values (
      ${input.userId}, ${input.serverId}, ${input.serverName}, ${input.fingerprint},
      ${seal(input.summary)}, ${seal(input.content)},
      now() + make_interval(days => ${ALERT_RETENTION_DAYS})
    )
    on conflict (server_id, fingerprint) do update set
      occurrences = public.alerts.occurrences + 1,
      last_seen_at = now(),
      expires_at = excluded.expires_at,
      server_name = excluded.server_name,
      summary_encrypted = excluded.summary_encrypted,
      content_encrypted = excluded.content_encrypted
    returning id, occurrences, (xmax = 0) as inserted
  `;

  if (row.inserted) {
    await db()`
      delete from public.alerts
      where id in (
        select id from public.alerts
        where user_id = ${input.userId}
        order by last_seen_at desc
        offset ${ALERTS_PER_ACCOUNT}
      )
    `;
  }

  return { id: row.id, occurrences: row.occurrences, isNew: row.inserted };
}

export async function listAlerts(userId: string): Promise<AlertRow[]> {
  const rows = await db()<StoredAlert[]>`
    select id, server_id, server_name, summary_encrypted, occurrences,
           first_seen_at, last_seen_at, expires_at
    from public.alerts
    where user_id = ${userId} and expires_at > now()
    order by last_seen_at desc
  `;
  return rows.map(({ summaryEncrypted, ...rest }) => ({ ...rest, summary: readable(summaryEncrypted) }));
}

export async function listAlertDetails(userId: string): Promise<AlertDetail[]> {
  const rows = await db()<StoredAlert[]>`
    select id, server_id, server_name, summary_encrypted, content_encrypted, occurrences,
           first_seen_at, last_seen_at, expires_at
    from public.alerts
    where user_id = ${userId} and expires_at > now()
    order by last_seen_at desc
  `;
  return rows.map(({ summaryEncrypted, contentEncrypted, ...rest }) => ({
    ...rest,
    summary: readable(summaryEncrypted),
    content: readable(contentEncrypted ?? ""),
  }));
}

export async function getAlert(userId: string, id: string): Promise<AlertDetail | null> {
  const [row] = await db()<StoredAlert[]>`
    select id, server_id, server_name, summary_encrypted, content_encrypted, occurrences,
           first_seen_at, last_seen_at, expires_at
    from public.alerts
    where id = ${id} and user_id = ${userId} and expires_at > now()
  `;
  if (!row) return null;
  const { summaryEncrypted, contentEncrypted, ...rest } = row;
  return {
    ...rest,
    summary: readable(summaryEncrypted),
    content: readable(contentEncrypted ?? ""),
  };
}

export async function deleteAlert(userId: string, id: string): Promise<boolean> {
  const rows = await db()<{ id: string }[]>`
    delete from public.alerts where id = ${id} and user_id = ${userId} returning id
  `;
  return rows.length > 0;
}
