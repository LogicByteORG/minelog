import { checkNameModeration } from "./moderation";

export const MAX_SOURCE_LENGTH = 32;

const ALLOWED = /^[\p{L}\p{M}\p{N}]+(?:[ ._+-]+[\p{L}\p{M}\p{N}]+)*$/u;

export function normalizeSource(input: unknown): string | null {
  if (typeof input !== "string") return null;

  const name = input.normalize("NFKC").replace(/\s+/g, " ").trim();
  if (name.length === 0 || name.length > MAX_SOURCE_LENGTH) return null;
  if (!ALLOWED.test(name)) return null;
  if (checkNameModeration(name)) return null;
  return name;
}

