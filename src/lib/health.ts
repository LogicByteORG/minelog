import { db } from "./db";

export type HealthStatus = "ok" | "degraded";

export interface DatabaseCheck {
  status: "ok" | "error";
  latencyMs: number;
}

export interface SiteHealth {
  status: "ok";
  service: "site";
  time: string;
  commit: string | null;
}

export interface ApiHealth {
  status: HealthStatus;
  service: "api";
  time: string;
  commit: string | null;
  database: DatabaseCheck;
}

export function shortCommit(): string | null {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA;
  return sha ? sha.slice(0, 7) : null;
}

export function siteHealth(): SiteHealth {
  return {
    status: "ok",
    service: "site",
    time: new Date().toISOString(),
    commit: shortCommit(),
  };
}

export function apiHealthFromCheck(check: DatabaseCheck): ApiHealth {
  return {
    status: check.status === "ok" ? "ok" : "degraded",
    service: "api",
    time: new Date().toISOString(),
    commit: shortCommit(),
    database: check,
  };
}

export async function checkDatabase(timeoutMs = 4000): Promise<DatabaseCheck> {
  const started = Date.now();
  try {
    await Promise.race([
      db()`select 1 as ok`,
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), timeoutMs)),
    ]);
    return { status: "ok", latencyMs: Date.now() - started };
  } catch {
    return { status: "error", latencyMs: Date.now() - started };
  }
}
