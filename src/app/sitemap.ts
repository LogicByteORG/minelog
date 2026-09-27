import type { MetadataRoute } from "next";
import { GUIDES } from "@/content/guides";
import { absoluteUrl } from "@/lib/seo";

const HOME_UPDATED = "2026-09-24";
const API_UPDATED = "2026-09-26";
const PRIVACY_UPDATED = "2026-09-24";
const TERMS_UPDATED = "2026-09-26";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/"), lastModified: HOME_UPDATED, changeFrequency: "monthly", priority: 1 },
    { url: absoluteUrl("/guides"), lastModified: HOME_UPDATED, changeFrequency: "monthly", priority: 0.8 },
    ...GUIDES.map((guide) => ({
      url: absoluteUrl(guide.path),
      lastModified: guide.updated,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    { url: absoluteUrl("/api"), lastModified: API_UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/privacy"), lastModified: PRIVACY_UPDATED, changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/terms"), lastModified: TERMS_UPDATED, changeFrequency: "yearly", priority: 0.3 },
  ];
}

