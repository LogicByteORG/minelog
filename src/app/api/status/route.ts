import { fetchPublicStatus } from "@/lib/status";

export const revalidate = 60;

export async function GET() {
  const state = await fetchPublicStatus();
  return Response.json(
    { state },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
  );
}
