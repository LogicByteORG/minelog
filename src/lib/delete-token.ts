const PREFIX = "minelog:delete:";
const CHANGED = "minelog:delete-token";

export type DeleteEntry = { token: string; until: number };

function store(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function saveDeleteToken(id: string, token: string, until: Date) {
  const storage = store();
  if (!storage) return;
  try {
    const now = Date.now();
    for (let i = storage.length - 1; i >= 0; i -= 1) {
      const key = storage.key(i);
      if (!key?.startsWith(PREFIX)) continue;
      const old = parseDeleteEntry(storage.getItem(key));
      if (!old || old.until <= now) storage.removeItem(key);
    }
    storage.setItem(PREFIX + id, JSON.stringify({ token, until: until.getTime() }));
  } catch {
  }
}

export function readDeleteRaw(id: string): string | null {
  try {
    return store()?.getItem(PREFIX + id) ?? null;
  } catch {
    return null;
  }
}

export function parseDeleteEntry(raw: string | null): DeleteEntry | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<DeleteEntry>;
    return typeof value.token === "string" && typeof value.until === "number"
      ? { token: value.token, until: value.until }
      : null;
  } catch {
    return null;
  }
}

export function forgetDeleteToken(id: string) {
  try {
    store()?.removeItem(PREFIX + id);
  } catch {
  }
  window.dispatchEvent(new Event(CHANGED));
}

export function subscribeDeleteTokens(notify: () => void) {
  window.addEventListener("storage", notify);
  window.addEventListener(CHANGED, notify);
  return () => {
    window.removeEventListener("storage", notify);
    window.removeEventListener(CHANGED, notify);
  };
}

