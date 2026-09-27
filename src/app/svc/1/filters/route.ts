import { json, preflight } from "@/lib/service/respond";

export const OPTIONS = preflight;

export function GET() {
  return json([]);
}

