import { findLogo } from "@/lib/log-pages";

// Page logos: api.minelog.org/cdn/<user>/<project>/<image>. The image id changes with every upload,
// so a logo can be cached for good.
export async function GET(
  _request: Request,
  { params }: RouteContext<"/svc/cdn/[user]/[project]/[image]">,
) {
  const { user, project, image } = await params;
  const logo = await findLogo(user, project, image);
  if (!logo) return new Response(null, { status: 404 });

  return new Response(new Uint8Array(logo.bytes), {
    headers: {
      "Content-Type": logo.type,
      "Content-Length": String(logo.bytes.length),
      "Cache-Control": "public, max-age=31536000, immutable",
      "Access-Control-Allow-Origin": "*",
      "Cross-Origin-Resource-Policy": "cross-origin",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
    },
  });
}
