import { revalidateTag, unstable_cache } from "next/cache";
import { LOG_CACHE_SECONDS } from "./config";
import { findLog, type StoredLog } from "./logs";
import { pageBase } from "./site";

type CachedLog = Omit<StoredLog, "createdAt" | "expiresAt"> & {
  createdAt: string;
  expiresAt: string;
};

class NoSuchLog extends Error {}

export const logTag = (id: string) => `log-${id}`;

export async function getCachedLog(id: string): Promise<StoredLog | null> {
  const load = unstable_cache(
    async (): Promise<CachedLog> => {
      const log = await findLog(id);
      if (!log) throw new NoSuchLog();
      return {
        ...log,
        createdAt: log.createdAt.toISOString(),
        expiresAt: log.expiresAt.toISOString(),
      };
    },
    ["log", id],
    { tags: [logTag(id)], revalidate: LOG_CACHE_SECONDS },
  );

  let cached: CachedLog;
  try {
    cached = await load();
  } catch (error) {
    if (error instanceof NoSuchLog) return null;
    throw error;
  }

  const expiresAt = new Date(cached.expiresAt);
  if (expiresAt.getTime() <= Date.now()) return null;
  return { ...cached, createdAt: new Date(cached.createdAt), expiresAt };
}

export async function forgetLog(id: string): Promise<void> {
  if (process.env.SERVICE !== "api") {
    try {
      revalidateTag(logTag(id), { expire: 0 });
    } catch (error) {
      console.error("Could not clear the cached copy of a deleted log:", error);
    }
    return;
  }

  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) return;
  try {
    await fetch(`${pageBase()}/api/revalidate`, {
      method: "POST",
      headers: { authorization: `Bearer ${secret}`, "content-type": "application/json" },
      body: JSON.stringify({ ids: [id] }),
      signal: AbortSignal.timeout(3000),
    });
  } catch (error) {
    console.error("Could not clear the cached copy of a deleted log:", error);
  }
}
