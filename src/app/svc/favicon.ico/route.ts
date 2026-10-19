import { pageBase } from "@/lib/site";

export function GET() {
  const site = pageBase();
  return new Response(null, {
    status: 308,
    headers: {
      Location: `${site}/favicon.ico/favicon.ico`,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
