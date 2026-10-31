import { analyze } from "@/lib/log";
import { buildLogPage } from "@/lib/log-page";
import type { LogPage } from "@/lib/log-cache";
import { SAMPLE_LOG } from "@/lib/samples";

// The sample log a custom page shows its owner, in the page's own look.
export function buildDemoLog(): LogPage {
  const sample = analyze(SAMPLE_LOG, true);
  const now = new Date();
  const data = buildLogPage({
    id: "demo",
    content: sample.output,
    kind: sample.kind,
    lineCount: sample.lineCount,
    byteSize: sample.bytes,
    errorCount: sample.errorCount,
    warnCount: sample.warnCount,
    privacyApplied: true,
    source: null,
    createdAt: now,
    expiresAt: new Date(now.getTime() + 120 * 86_400_000),
  });
  return { ...data, createdAt: now, expiresAt: new Date(data.expiresAt) };
}
