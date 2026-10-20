import { db } from "./db";
import { forgetLog } from "./log-cache";

const FORGET_BATCH = 50;

export async function deleteLogsOf(userId: string): Promise<number> {
  const rows = await db()<{ id: string }[]>`
    delete from public.logs
    where user_id = ${userId}
    returning id
  `;

  for (let start = 0; start < rows.length; start += FORGET_BATCH) {
    await Promise.all(rows.slice(start, start + FORGET_BATCH).map((row) => forgetLog(row.id)));
  }
  return rows.length;
}
