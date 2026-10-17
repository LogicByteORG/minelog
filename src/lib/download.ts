export function logDownloadName(logId: string): string {
  const clean = logId.replace(/[^a-zA-Z0-9_-]/g, "");
  return `minelog-${clean || "log"}.txt`;
}
