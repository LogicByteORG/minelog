import { db } from "./db";

export async function toggleHeartbeat() {
  await db()`
    with removed as (
      delete from public.heartbeat where category = 'ONLINE' returning category
    )
    insert into public.heartbeat (category, message)
    select 'ONLINE', 'HI'
    where not exists (select 1 from removed)
  `;
}
