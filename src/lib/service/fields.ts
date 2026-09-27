export function readFields(text: string, contentType: string): Record<string, unknown> | null {
  if (contentType.toLowerCase().includes("json")) {
    try {
      const payload: unknown = JSON.parse(text);
      if (payload === null || typeof payload !== "object" || Array.isArray(payload)) return null;
      return payload as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  return Object.fromEntries(new URLSearchParams(text));
}

export function queryFlag(value: string | null): boolean | string | undefined {
  if (value === null) return undefined;
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
}

