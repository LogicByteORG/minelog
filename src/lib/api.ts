export type CreatedLog = {
  id: string;
  url: string;
  expiresAt: Date;
  deleteToken: string | null;
  deleteUntil: Date | null;
};

const GZIP_THRESHOLD = 64 * 1024;

export async function createLog(
  content: string,
  hidePrivate: boolean,
): Promise<CreatedLog> {
  const json = JSON.stringify({ content, hidePrivate });
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  let body: BodyInit = json;

  if (json.length > GZIP_THRESHOLD && typeof CompressionStream !== "undefined") {
    const stream = new Blob([json])
      .stream()
      .pipeThrough(new CompressionStream("gzip"));
    body = await new Response(stream).blob();
    headers["Content-Encoding"] = "gzip";
  }

  let response: Response;
  try {
    response = await fetch("/api/log", { method: "POST", headers, body });
  } catch {
    throw new Error(
      "Couldn't reach minelog. Check your connection and try again.",
    );
  }

  const data = await response.json().catch(() => null);
  if (!response.ok || !data) {
    throw new Error(
      typeof data?.error === "string"
        ? data.error
        : "Couldn't save the log. Try again in a moment.",
    );
  }

  return {
    id: data.id,
    url: data.url,
    expiresAt: new Date(data.expiresAt),
    deleteToken: typeof data.deleteToken === "string" ? data.deleteToken : null,
    deleteUntil: data.deletableUntil ? new Date(data.deletableUntil) : null,
  };
}

export async function deleteLog(id: string, token: string): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`/api/log/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new Error("Couldn't reach minelog. Check your connection and try again.");
  }
  if (response.ok) return;

  const data = await response.json().catch(() => null);
  throw new Error(
    typeof data?.error === "string"
      ? data.error
      : "Couldn't delete the log. Try again in a moment.",
  );
}

