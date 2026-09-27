import { hashIp } from "@/lib/logs";
import { takeHit } from "./limiter";
import { clientIp } from "./upload";

export function waitFor(request: Request, bucket: string, limit: number): number | null {
  const hit = takeHit(`${bucket}:${hashIp(clientIp(request))}`, limit);
  return hit.ok ? null : hit.retryAfter;
}

