import { STATUS_URL } from "./config";

export type PublicStatus = "operational" | "degraded" | "down" | "maintenance" | "unknown";

export const STATUS_LABEL: Record<PublicStatus, string> = {
  operational: "All systems operational",
  degraded: "Some systems are degraded",
  down: "Service disruption",
  maintenance: "Maintenance in progress",
  unknown: "Open the status page",
};

export function statusFromAggregate(value: unknown): PublicStatus {
  if (value === "operational") return "operational";
  if (value === "degraded") return "degraded";
  if (value === "downtime") return "down";
  if (value === "maintenance") return "maintenance";
  return "unknown";
}

export async function fetchPublicStatus(): Promise<PublicStatus> {
  try {
    const response = await fetch(`${STATUS_URL}/index.json`, {
      headers: { accept: "application/json" },
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) return "unknown";
    const body = (await response.json()) as {
      data?: { attributes?: { aggregate_state?: unknown } };
    };
    return statusFromAggregate(body.data?.attributes?.aggregate_state);
  } catch {
    return "unknown";
  }
}
