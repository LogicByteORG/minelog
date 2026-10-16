const REPORT_EVERY_MS = 120;

export async function loadText(
  url: string,
  onBytes: (received: number) => void,
  signal: AbortSignal,
): Promise<string> {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`The log could not be loaded (${response.status}).`);
  if (!response.body) return response.text();

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const parts: string[] = [];
  let received = 0;
  let reported = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    parts.push(decoder.decode(value, { stream: true }));
    const now = performance.now();
    if (now - reported >= REPORT_EVERY_MS) {
      reported = now;
      onBytes(received);
    }
  }
  parts.push(decoder.decode());
  onBytes(received);
  return parts.join("");
}
