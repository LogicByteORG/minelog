import {
  ANALYSES_PER_MINUTE,
  INSIGHT_READS_PER_MINUTE,
  MAX_ANALYSE_BYTES,
  MAX_LOG_LINES,
} from "@/lib/config";
import { readInsights, type Insights } from "@/lib/diagnose/insights";
import { countLines, detectKind } from "@/lib/log";
import { redact } from "@/lib/redact";
import { readBodyText } from "./body";
import { waitFor } from "./rate";
import { UploadError, isBinaryText } from "./upload";

const ANALYSE_BODY_LIMIT = MAX_ANALYSE_BYTES * 2;

export async function readAnalyseBody(request: Request): Promise<string> {
  const wait = waitFor(request, "analyse", ANALYSES_PER_MINUTE);
  if (wait !== null) {
    throw new UploadError(
      429,
      "rate_limited",
      `Too many analyses from this connection. Try again in ${wait} seconds.`,
      wait,
    );
  }
  return readBodyText(request, ANALYSE_BODY_LIMIT);
}

export function guardInsightRead(request: Request): void {
  const wait = waitFor(request, "insights", INSIGHT_READS_PER_MINUTE);
  if (wait !== null) {
    throw new UploadError(
      429,
      "rate_limited",
      `Too many requests for findings from this connection. Try again in ${wait} seconds.`,
      wait,
    );
  }
}

export type AnalyseInput = {
  content: unknown;
  hidePrivate: unknown;
};

export function analyseText({ content, hidePrivate }: AnalyseInput): Insights {
  if (typeof content !== "string" || content.trim().length === 0) {
    throw new UploadError(400, "empty_content", "There is no log text in this request.");
  }
  if (hidePrivate !== undefined && typeof hidePrivate !== "boolean") {
    throw new UploadError(400, "invalid_option", "hidePrivate must be true or false.");
  }
  if (isBinaryText(content)) {
    throw new UploadError(400, "not_plain_text", "Only plain text logs and configs can be analysed.");
  }
  if (Buffer.byteLength(content) > MAX_ANALYSE_BYTES) {
    throw new UploadError(
      413,
      "log_too_large",
      `This log is too large to analyse. The limit is ${MAX_ANALYSE_BYTES / (1024 * 1024)} MB.`,
    );
  }
  if (countLines(content) > MAX_LOG_LINES) {
    throw new UploadError(
      413,
      "too_many_lines",
      `This log has too many lines. The limit is ${MAX_LOG_LINES.toLocaleString("en")}.`,
    );
  }

  const kind = detectKind(content);
  const text = hidePrivate === false ? content : redact(content).text;
  return readInsights(text, kind);
}

