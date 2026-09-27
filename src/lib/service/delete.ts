import { DELETES_PER_MINUTE, DELETE_WINDOW_MINUTES } from "@/lib/config";
import { isValidId } from "@/lib/ids";
import { forgetLog } from "@/lib/log-cache";
import { deleteLog } from "@/lib/logs";
import { waitFor } from "./rate";

export type DeleteCode =
  | "not_found"
  | "missing_token"
  | "invalid_token"
  | "not_deletable"
  | "delete_window_closed"
  | "rate_limited"
  | "server_error";

export class DeleteError extends Error {
  status: number;
  code: DeleteCode;
  retryAfter?: number;

  constructor(status: number, code: DeleteCode, message: string, retryAfter?: number) {
    super(message);
    this.name = "DeleteError";
    this.status = status;
    this.code = code;
    this.retryAfter = retryAfter;
  }
}

export function tooManyDeletes(wait: number): DeleteError {
  return new DeleteError(
    429,
    "rate_limited",
    `Too many delete requests from this connection. Try again in ${wait} seconds.`,
    wait,
  );
}

export function bearerToken(request: Request): string | null {
  const match = /^Bearer\s+(\S+)\s*$/i.exec(request.headers.get("authorization") ?? "");
  return match ? match[1] : null;
}

const day = (date: Date) => date.toISOString().slice(0, 10);

export async function deleteLogFor(id: string, request: Request): Promise<void> {
  const wait = waitFor(request, "delete", DELETES_PER_MINUTE);
  if (wait !== null) throw tooManyDeletes(wait);

  if (!isValidId(id)) {
    throw new DeleteError(404, "not_found", "This log doesn't exist or has expired.");
  }
  const token = bearerToken(request);
  if (!token) {
    throw new DeleteError(
      401,
      "missing_token",
      "Send the delete token as Authorization: Bearer <token>.",
    );
  }
  await deleteLogWithToken(id, token);
}

export async function deleteLogWithToken(id: string, token: string): Promise<void> {
  if (!isValidId(id)) {
    throw new DeleteError(404, "not_found", "This log doesn't exist or has expired.");
  }

  let result;
  try {
    result = await deleteLog(id, token);
  } catch (error) {
    console.error("Deleting a log failed:", error);
    throw new DeleteError(500, "server_error", "Couldn't delete the log. Try again in a moment.");
  }

  switch (result.status) {
    case "deleted":
      await forgetLog(id);
      return;
    case "not_found":
      throw new DeleteError(404, "not_found", "This log doesn't exist or has expired.");
    case "invalid_token":
      throw new DeleteError(403, "invalid_token", "That delete token doesn't match this log.");
    case "not_deletable":
      throw new DeleteError(
        403,
        "not_deletable",
        `This log can't be deleted early. It is removed automatically on ${day(result.expiresAt)}.`,
      );
    case "window_closed":
      throw new DeleteError(
        403,
        "delete_window_closed",
        `A log can only be deleted in the first ${DELETE_WINDOW_MINUTES} minutes after it's saved. This one is removed automatically on ${day(result.expiresAt)}.`,
      );
  }
}

