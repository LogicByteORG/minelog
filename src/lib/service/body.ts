import { gunzipSync } from "node:zlib";
import { MAX_LOG_BYTES } from "@/lib/config";

export const BODY_LIMIT = MAX_LOG_BYTES * 2;

export type BodyProblem = "too_large" | "bad_gzip";

export class BodyError extends Error {
  problem: BodyProblem;
  constructor(problem: BodyProblem) {
    super(problem);
    this.name = "BodyError";
    this.problem = problem;
  }
}

async function readLimited(request: Request, limit: number): Promise<Buffer> {
  const reader = request.body?.getReader();
  if (!reader) return Buffer.alloc(0);

  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > limit) {
      await reader.cancel().catch(() => {});
      throw new BodyError("too_large");
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks, total);
}

export async function readBodyText(request: Request, limit = BODY_LIMIT): Promise<string> {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > limit) throw new BodyError("too_large");

  let body = await readLimited(request, limit);

  if (request.headers.get("content-encoding")?.toLowerCase() === "gzip") {
    try {
      body = gunzipSync(body, { maxOutputLength: limit });
    } catch (error) {
      const tooBig =
        (error as { code?: string }).code === "ERR_BUFFER_TOO_LARGE";
      throw new BodyError(tooBig ? "too_large" : "bad_gzip");
    }
  }
  return body.toString("utf8");
}
