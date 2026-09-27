import { analyticsAllowed } from "@/lib/region";

export function GET(request: Request) {
  const allowed = analyticsAllowed(request.headers.get("x-vercel-ip-country"));
  return Response.json(
    { analytics: allowed },
    { headers: { "Cache-Control": "no-store" } },
  );
}

