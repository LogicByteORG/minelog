export const HANDLE_MAX = 32;

export const HANDLE_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,30}[a-z0-9])?$/;

const BASE_MAX = 28;

const FALLBACK = "webhook";

const LOOKALIKES: Record<string, string> = {
  ı: "i",
  ł: "l",
  ø: "o",
  đ: "d",
  ß: "ss",
  æ: "ae",
};

export function handleFromName(name: string): string {
  const slug = name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[ıłødßæ]/g, (letter) => LOOKALIKES[letter] ?? letter)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, BASE_MAX)
    .replace(/-+$/g, "");
  return slug || FALLBACK;
}

export function normalizeHandle(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const handle = raw.trim().toLowerCase();
  return HANDLE_PATTERN.test(handle) ? handle : null;
}

export function uniqueHandle(base: string, taken: Iterable<string>): string {
  const used = new Set(taken);
  if (!used.has(base)) return base;
  for (let n = 2; ; n += 1) {
    const suffix = `-${n}`;
    const candidate = `${base.slice(0, HANDLE_MAX - suffix.length)}${suffix}`;
    if (!used.has(candidate)) return candidate;
  }
}
