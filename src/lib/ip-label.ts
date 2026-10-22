const HIDDEN = /^(0\.0\.0\.0|127\.|::1?$)/;

export function readableIp(raw: string | null | undefined): string | null {
  const value = raw?.trim();
  if (!value) return null;

  const address = value.startsWith("::ffff:") ? value.slice(7) : value;
  if (address.includes(":")) {
    try {
      const compact = new URL(`http://[${address}]`).hostname.slice(1, -1);
      return HIDDEN.test(compact) ? null : compact;
    } catch {
      return null;
    }
  }

  return HIDDEN.test(address) ? null : address;
}
