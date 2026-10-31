import { API_BASE, SITE_BASE } from "./config";

function trim(address: string): string {
  return address.replace(/\/+$/, "");
}

export function siteUrl(requestOrigin: string): string {
  return trim(process.env.SITE_URL ?? requestOrigin);
}

function previewBase(): string | null {
  if (process.env.VERCEL_ENV !== "preview") return null;
  const host = process.env.VERCEL_URL?.trim();
  if (!host) return null;
  return `https://${host}`;
}

export function pageBase(): string {
  if (process.env.SITE_URL) return trim(process.env.SITE_URL);
  const preview = previewBase();
  if (preview) return preview;
  const fallback =
    process.env.NODE_ENV === "production" ? SITE_BASE : "http://localhost:3000";
  return trim(fallback);
}

export function apiBase(requestOrigin: string): string {
  return trim(process.env.API_URL ?? requestOrigin);
}

export function publicApiBase(): string {
  const fallback =
    process.env.NODE_ENV === "production" ? API_BASE : "http://localhost:4000";
  return trim(process.env.API_URL ?? fallback);
}

export function rawUrl(id: string): string {
  return `${publicApiBase()}/v2/logs/${id}/raw`;
}


export function downloadUrl(id: string): string {
  return `${publicApiBase()}/v2/logs/${id}/download`;
}
