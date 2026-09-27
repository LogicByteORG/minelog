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

export async function readBodyText(request: Request, limit = BODY_LIMIT): Promise<string> {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > limit) throw new BodyError("too_large");

  let body = Buffer.from(await request.arrayBuffer());
  if (body.length > limit) throw new BodyError("too_large");

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

