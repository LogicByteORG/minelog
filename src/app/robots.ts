import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/log", "/api/auth", "/login", "/dash", "/p/"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}

