const UNITS: [limit: number, size: number, name: string][] = [
  [60, 1, "second"],
  [3600, 60, "minute"],
  [86400, 3600, "hour"],
  [Infinity, 86400, "day"],
];

export function timeAgo(date: Date, now: Date = new Date()): string {
  const seconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));
  if (seconds < 10) return "just now";
  for (const [limit, size, name] of UNITS) {
    if (seconds < limit) {
      const count = Math.floor(seconds / size);
      return `${count} ${name}${count === 1 ? "" : "s"} ago`;
    }
  }
  return "";
}

export function formatUtc(date: Date): string {
  return `${date.toISOString().slice(0, 16).replace("T", " ")} UTC`;
}

