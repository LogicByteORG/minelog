import {
  BlockedContentError,
  LogTooLargeError,
  LogTooLongError,
  hashIp,
  RateLimitedError,
  saveLog,
  type SavedLog,
} from "@/lib/logs";
import { moderationMessage } from "@/lib/moderation";
import { normalizeSource } from "@/lib/source";

export type UploadCode =
  | "empty_content"
  | "not_plain_text"
  | "invalid_option"
  | "log_too_large"
  | "too_many_lines"
  | "blocked_content"
  | "rate_limited"
  | "server_error";

export class UploadError extends Error {
  status: number;
  code: UploadCode;
  retryAfter?: number;

  constructor(status: number, code: UploadCode, message: string, retryAfter?: number) {
    super(message);
    this.name = "UploadError";
    this.status = status;
    this.code = code;
    this.retryAfter = retryAfter;
  }
}

export function isBinaryText(text: string): boolean {
  if (text.includes("\u0000")) return true;
  const sample = text.slice(0, 2000);
  let bad = 0;
  for (const char of sample) {
    if (char === "�") bad += 1;
  }
  return sample.length > 0 && bad > 40;
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

export type UploadInput = {
  content: unknown;
  hidePrivate: unknown;
  source: unknown;
  request: Request;
};

export async function uploadLog({
  content,
  hidePrivate,
  source,
  request,
}: UploadInput): Promise<SavedLog> {
  if (typeof content !== "string" || content.trim().length === 0) {
    throw new UploadError(400, "empty_content", "There is no log text in this request.");
  }
  if (hidePrivate !== undefined && typeof hidePrivate !== "boolean") {
    throw new UploadError(400, "invalid_option", "hidePrivate must be true or false.");
  }
  if (isBinaryText(content)) {
    throw new UploadError(
      400,
      "not_plain_text",
      "Only plain text logs and configs can be shared.",
    );
  }

  try {
    const ipHash = hashIp(clientIp(request));
    return await saveLog({
      content,
      hidePrivate: hidePrivate !== false,
      ipHash,
      source: normalizeSource(source ?? request.headers.get("x-minelog-client")),
    });
  } catch (error) {
    if (error instanceof UploadError) throw error;
    if (error instanceof RateLimitedError) {
      throw new UploadError(
        429,
        "rate_limited",
        "Too many uploads from this connection. Try again in a minute.",
        60,
      );
    }
    if (error instanceof LogTooLargeError) {
      throw new UploadError(413, "log_too_large", error.message);
    }
    if (error instanceof LogTooLongError) {
      throw new UploadError(413, "too_many_lines", error.message);
    }
    if (error instanceof BlockedContentError) {
      throw new UploadError(
        422,
        "blocked_content",
        moderationMessage(error.detail),
      );
    }
    console.error("Saving a log failed:", error);
    throw new UploadError(
      500,
      "server_error",
      "Couldn't save the log. Try again in a moment.",
    );
  }
}

