export const LABEL_MAX = 40;

export function cleanLabel(raw: unknown, max: number): string | null {
  if (raw === undefined || raw === null) return "";
  if (typeof raw !== "string") return null;
  const label = raw
    .normalize("NFKC")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return label.length > max ? null : label;
}

export const ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function sameName(a: string, b: string): boolean {
  return a.normalize("NFKC").trim().toLowerCase() === b.normalize("NFKC").trim().toLowerCase();
}

// "Paper 1.21.8" taken? Then "Paper 1.21.8 2", "Paper 1.21.8 3", and so on.
export function uniqueName(base: string, taken: Iterable<string>, max = LABEL_MAX): string {
  const used = [...taken];
  const free = (name: string) => !used.some((other) => sameName(other, name));
  if (free(base)) return base;
  for (let n = 2; ; n += 1) {
    const suffix = ` ${n}`;
    const candidate = `${base.slice(0, max - suffix.length).trimEnd()}${suffix}`;
    if (free(candidate)) return candidate;
  }
}
