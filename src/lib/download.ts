export function logDownloadName(logId: string): string {
  const clean = logId.replace(/[^a-zA-Z0-9_-]/g, "");
  return `minelog-${clean || "log"}.txt`;
}

export function downloadTextFile(name: string, text: string): void {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
