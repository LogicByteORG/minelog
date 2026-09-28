import {
  ANALYSES_PER_MINUTE,
  API_BASE,
  BULK_DELETES_PER_MINUTE,
  BULK_DELETE_LIMIT,
  DELETES_PER_MINUTE,
  DELETE_WINDOW_MINUTES,
  INSIGHT_READS_PER_MINUTE,
  MAX_ANALYSE_BYTES,
  MAX_LOG_BYTES,
  MAX_LOG_LINES,
  RETENTION_DAYS,
  SITE_BASE,
  UPLOADS_PER_DAY,
  UPLOADS_PER_MINUTE,
} from "@/lib/config";
import { readInsights } from "@/lib/diagnose/insights";
import { describeCompatInsights, describeV2Insights } from "@/lib/service/describe-insights";

const ID = "k7M2xq9D4";

export type Sample = { id: string; label: string; code: string };

export type Param = {
  name: string;
  type: string;
  need: string;
  where?: string;
  text: string;
};

export const UPLOAD_SAMPLES: Sample[] = [
  {
    id: "curl",
    label: "curl",
    code: `curl --data-binary @latest.log \\
  -H "Content-Type: text/plain" \\
  "${API_BASE}/v2/logs?source=MyLauncher"`,
  },
  {
    id: "js",
    label: "JavaScript",
    code: `const res = await fetch("${API_BASE}/v2/logs", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ content: logText, source: "MyLauncher" }),
});

const data = await res.json();
if (!res.ok) throw new Error(data.error.message);

console.log(data.url); // ${SITE_BASE}/${ID}`,
  },
  {
    id: "python",
    label: "Python",
    code: `import requests

with open("latest.log", "rb") as file:
    res = requests.post(
        "${API_BASE}/v2/logs",
        params={"source": "MyLauncher"},
        data=file,
        headers={"Content-Type": "text/plain"},
        timeout=30,
    )

res.raise_for_status()
print(res.json()["url"])  # ${SITE_BASE}/${ID}`,
  },
  {
    id: "java",
    label: "Java",
    code: `HttpClient client = HttpClient.newHttpClient();

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("${API_BASE}/v2/logs?source=MyLauncher"))
    .header("Content-Type", "text/plain; charset=utf-8")
    .POST(HttpRequest.BodyPublishers.ofFile(Path.of("logs/latest.log")))
    .build();

HttpResponse<String> response =
    client.send(request, HttpResponse.BodyHandlers.ofString());

// 201 on success, the body is JSON with "url" in it
System.out.println(response.body());`,
  },
];

const CREATED = {
  id: ID,
  url: `${SITE_BASE}/${ID}`,
  raw: `${API_BASE}/v2/logs/${ID}/raw`,
  source: "MyLauncher",
  kind: "server",
  lines: 1204,
  size: 88012,
  errors: 3,
  warnings: 11,
  privacyApplied: true,
  createdAt: "2026-09-24T10:40:55Z",
  expiresAt: "2027-01-22T10:40:55Z",
  deleteToken: "Vt3mQ8xZk1cR7pLw0aNe5Yf2HbJdUgS4",
  deletableUntil: "2026-09-24T11:40:55Z",
};

export const CREATED_JSON = JSON.stringify(CREATED, null, 2);

export const LIMITS = [
  {
    label: "Largest log",
    value: `${MAX_LOG_BYTES / (1024 * 1024)} MB`,
    text: "Measured on the text that gets saved, after private details are hidden. With gzip, the unpacked size is what counts.",
  },
  {
    label: "Most lines",
    value: MAX_LOG_LINES.toLocaleString("en"),
    text: "A log with one very long line counts as one line. The size limit still applies to it.",
  },
  {
    label: "Kept for",
    value: `${RETENTION_DAYS} days`,
    text: "Every log deletes itself after this long. You can't extend it.",
  },
  {
    label: "Delete window",
    value: `${DELETE_WINDOW_MINUTES} minutes`,
    text: "The person who saved a log can delete it with its delete token during this time. After that it stays until it expires.",
  },
  {
    label: "Uploads",
    value: `${UPLOADS_PER_MINUTE} per minute`,
    text: "Per connection. Counted in the database, so it is exact. Reading a log doesn't count.",
  },
  {
    label: "Uploads a day",
    value: `${UPLOADS_PER_DAY} per day`,
    text: "Per connection, over the last 24 hours. When you reach it, Retry-After tells you when the oldest of those uploads drops out of the count.",
  },
  {
    label: "Largest text to analyse",
    value: `${MAX_ANALYSE_BYTES / (1024 * 1024)} MB`,
    text: `For the analyse endpoints, which read text without saving it. The line limit is the same ${MAX_LOG_LINES.toLocaleString("en")}.`,
  },
  {
    label: "Analyses",
    value: `${ANALYSES_PER_MINUTE} per minute`,
    text: "Per connection. Each of our servers counts on its own, so treat it as a fair-use limit and not an exact number.",
  },
  {
    label: "Reading findings",
    value: `${INSIGHT_READS_PER_MINUTE} per minute`,
    text: "Per connection, for the findings of a saved log. Answers are cached for a minute, and a cached answer never reaches us, so it doesn't count.",
  },
  {
    label: "Deleting",
    value: `${DELETES_PER_MINUTE} per minute`,
    text: `Per connection. A bulk delete counts on its own limit of ${BULK_DELETES_PER_MINUTE} calls a minute.`,
  },
];

export const LIMITS_JSON = JSON.stringify(
  {
    retentionDays: RETENTION_DAYS,
    maxBytes: MAX_LOG_BYTES,
    maxLines: MAX_LOG_LINES,
    uploadsPerMinute: UPLOADS_PER_MINUTE,
    uploadsPerDay: UPLOADS_PER_DAY,
    maxAnalyseBytes: MAX_ANALYSE_BYTES,
    analysesPerMinute: ANALYSES_PER_MINUTE,
  },
  null,
  2,
);

export const CREATE_PARAMS: Param[] = [
  {
    name: "content",
    type: "string",
    need: "required",
    where: "JSON body",
    text: "The log text. In plain text mode you leave this out and the whole request body is the log.",
  },
  {
    name: "hidePrivate",
    type: "boolean",
    need: "default true",
    where: "JSON body or query",
    text: "Hides IP addresses, MAC addresses, user folder names, tokens and emails before saving. The server does it again on its own copy, so a client that skips it can't leak anything.",
  },
  {
    name: "source",
    type: "string",
    need: "optional",
    where: "JSON body, query or X-Minelog-Client header",
    text: "The name of the app that is uploading, like MyLauncher. It shows as a badge on the log page. Names that don't fit the rules above are ignored, not treated as errors.",
  },
];

export const LOG_FIELDS: Param[] = [
  { name: "id", type: "string", need: "", text: "Nine characters, case sensitive. Ids can't be guessed." },
  { name: "url", type: "string", need: "", text: "The page where people read the log." },
  { name: "raw", type: "string", need: "", text: "The whole log as plain text." },
  { name: "source", type: "string | null", need: "", text: "The source name as saved, or null if none was sent or it was ignored." },
  { name: "kind", type: "string", need: "", text: "What minelog detected: server, client, crash, jvm, yaml, toml, props, json, readme or unknown." },
  { name: "lines", type: "number", need: "", text: "Number of lines saved." },
  { name: "size", type: "number", need: "", text: "Size of the saved text in bytes." },
  { name: "errors", type: "number", need: "", text: "Number of error entries. A whole stack trace counts once." },
  { name: "warnings", type: "number", need: "", text: "Number of warning entries." },
  { name: "privacyApplied", type: "boolean", need: "", text: "False if hidePrivate was turned off for this log." },
  { name: "createdAt", type: "string", need: "", text: "When it was saved, in ISO 8601 UTC." },
  { name: "expiresAt", type: "string", need: "", text: "When it will be deleted, in ISO 8601 UTC." },
  { name: "deleteToken", type: "string", need: "", text: "Only in the answer to saving a log, and never shown again: we keep a hash, not the token. Keep it if the log may need deleting. See Delete a log." },
  { name: "deletableUntil", type: "string", need: "", text: "Only in the answer to saving. Until when the token can delete the log, in ISO 8601 UTC." },
];

export const NOT_FOUND_JSON = JSON.stringify(
  {
    error: {
      code: "not_found",
      message: "This log doesn't exist or has expired.",
    },
  },
  null,
  2,
);

export const ERRORS: { code: string; status: number; text: string }[] = [
  { code: "invalid_body", status: 400, text: "The body isn't valid JSON or gzip, or isn't text." },
  { code: "empty_content", status: 400, text: "There's no log text to save or analyse." },
  { code: "not_plain_text", status: 400, text: "The content looks like a binary file. Only plain text logs and configs can be shared." },
  { code: "invalid_option", status: 400, text: "An option has the wrong type, like a hidePrivate that isn't true or false." },
  { code: "not_found", status: 404, text: "The log doesn't exist or has expired." },
  { code: "missing_token", status: 401, text: "A delete request had no Authorization: Bearer header." },
  { code: "invalid_token", status: 403, text: "The delete token doesn't match this log." },
  { code: "delete_window_closed", status: 403, text: `The delete window is over. A log can only be deleted in the first ${DELETE_WINDOW_MINUTES} minutes after it's saved.` },
  { code: "not_deletable", status: 403, text: "The log was saved before deleting existed, so it has no token. It deletes itself on schedule." },
  { code: "log_too_large", status: 413, text: "The log is over the size limit. Analysing has a lower limit than saving, see Limits." },
  { code: "too_many_lines", status: 413, text: "The log is over the line limit." },
  { code: "blocked_content", status: 422, text: "The log contains content we can't host, or reads like an environment file with secrets. For the content filter the message gives the line number and the text around the match, so you know what to remove." },
  { code: "rate_limited", status: 429, text: "Too many uploads, analyses, reads of findings or deletes from this connection. Retry-After tells you how many seconds to wait." },
  { code: "server_error", status: 500, text: "Something broke on our side. Nothing was saved, so it's safe to try again in a moment." },
];

export const ERROR_JSON = JSON.stringify(
  {
    error: {
      code: "too_many_lines",
      message: `This log has too many lines. The limit is ${MAX_LOG_LINES.toLocaleString("en")}.`,
    },
  },
  null,
  2,
);

export const DELETE_SAMPLES: Sample[] = [
  {
    id: "curl",
    label: "curl",
    code: `curl -X DELETE ${API_BASE}/v2/logs/${ID} \\
  -H "Authorization: Bearer Vt3mQ8xZk1cR7pLw0aNe5Yf2HbJdUgS4"`,
  },
];

export const DELETED_JSON = JSON.stringify({ id: ID, deleted: true }, null, 2);

const SAMPLE_LOG = [
  "[12:00:00 INFO]: Starting minecraft server version 1.20.1",
  "[12:00:00 INFO]: This server is running Paper version git-Paper-196 (MC: 1.20.1) (Implementing API version 1.20.1-R0.1-SNAPSHOT)",
  "[12:00:01 ERROR]: java.lang.OutOfMemoryError: Java heap space",
].join("\n");

const SAMPLE_INSIGHTS = readInsights(SAMPLE_LOG, "server");

export const INSIGHTS_JSON = JSON.stringify(describeV2Insights(SAMPLE_INSIGHTS), null, 2);
export const COMPAT_INSIGHTS_JSON = JSON.stringify(describeCompatInsights(SAMPLE_INSIGHTS), null, 2);

export const INSIGHTS_SAMPLES: Sample[] = [
  {
    id: "curl",
    label: "curl",
    code: `curl ${API_BASE}/v2/logs/${ID}/insights`,
  },
  {
    id: "js",
    label: "JavaScript",
    code: `const res = await fetch("${API_BASE}/v2/logs/${ID}/insights");
const found = await res.json();
if (!res.ok) throw new Error(found.error.message);

console.log(found.title); // Paper 1.20.1 Server Log
for (const problem of found.problems) {
  console.log(problem.message, problem.solutions[0]);
}`,
  },
];

export const ANALYSE_SAMPLES: Sample[] = [
  {
    id: "curl",
    label: "curl",
    code: `curl --data-binary @latest.log \\
  -H "Content-Type: text/plain" \\
  ${API_BASE}/v2/analyse`,
  },
  {
    id: "js",
    label: "JavaScript",
    code: `const res = await fetch("${API_BASE}/v2/analyse", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ content: logText }),
});

const found = await res.json();
if (!res.ok) throw new Error(found.error.message);

console.log(found.title, found.problems.length);`,
  },
];

export const ANALYSE_PARAMS: Param[] = [
  {
    name: "content",
    type: "string",
    need: "required",
    where: "JSON body",
    text: "The log text. In plain text mode you leave this out and the whole request body is the log.",
  },
  {
    name: "hidePrivate",
    type: "boolean",
    need: "default true",
    where: "JSON body or query",
    text: "Hides IP addresses, MAC addresses, user folder names, tokens and emails before the text is read, the same step as when saving. Nothing is saved either way.",
  },
];

export const INSIGHT_FIELDS: Param[] = [
  { name: "kind", type: "string", need: "", text: "What minelog detected, with the same values as kind on a saved log." },
  { name: "title", type: "string", need: "", text: "A short name, like Paper 1.20.1 Server Log." },
  { name: "software", type: "object", need: "", text: "The id and name of the server software or mod loader the log shows, or Vanilla when it names none." },
  { name: "minecraftVersion", type: "string | null", need: "", text: "The game version, or null when the log doesn't say." },
  { name: "environment", type: "object", need: "", text: "The setup the log states: gameVersion, loader, java and launcher, and a list of conflicts. Each fact is null when the log doesn't say, or an object described below." },
  { name: "environment.conflicts", type: "string[]", need: "", text: "Facts the log states in two conflicting ways. minelog leaves them out instead of guessing, and names them here." },
  { name: "mods", type: "object[]", need: "", text: "Every mod or plugin the log lists, with kind (mod or plugin), name, id, version and the line it is on. Empty for logs that list none." },
  { name: "bundledMods", type: "number", need: "", text: "Mods packed inside other mods, which Fabric counts on its own. They are counted here, not listed." },
  { name: "problems", type: "object[]", need: "", text: "Known problems found in the log, in the order they appear. Described below." },
];

export const FACT_FIELDS: Param[] = [
  { name: "value", type: "string", need: "", text: "The raw value, like fabric, 21 or 1.20.1." },
  { name: "text", type: "string", need: "", text: "The same, ready to show people, like Fabric 0.15.7." },
  { name: "detail", type: "string | null", need: "", text: "Extra detail when the log gives it, like a loader version or a Java vendor." },
  { name: "confidence", type: "string", need: "", text: "high when at least two different kinds of source in the log agree, medium when the log says it once." },
  { name: "lines", type: "number[]", need: "", text: "The first few lines it was read from, numbered like the log page." },
  { name: "others", type: "object[]", need: "", text: "Other values the log also states with real weight, each with value and lines. Shown for context, never used to pick the answer." },
];

export const PROBLEM_FIELDS: Param[] = [
  { name: "id", type: "string", need: "", text: "A stable name for this kind of problem, listed below. Branch on it, not on the message." },
  { name: "message", type: "string", need: "", text: "What is wrong, in plain words. It can name a plugin or a Java version from the log." },
  { name: "solutions", type: "string[]", need: "", text: "What to try, most likely fix first." },
  { name: "count", type: "number", need: "", text: "How many lines of the log showed it. Repeats are counted, not listed again." },
  { name: "line", type: "number", need: "", text: "The first line that showed it." },
];

export const PROBLEM_DOCS: { id: string; text: string }[] = [
  { id: "out-of-memory", text: "Java ran out of heap memory (Java heap space, GC overhead limit exceeded)." },
  { id: "native-thread", text: "Java couldn't create another thread, which is a system limit." },
  { id: "system-memory", text: "A Java crash log says the computer itself ran out of memory." },
  { id: "java-version", text: "Something needs a newer Java than the one running it (UnsupportedClassVersionError)." },
  { id: "server-overloaded", text: "The Can't keep up warning showed up at least three times." },
  { id: "port-bind", text: "The server couldn't use its port (FAILED TO BIND TO PORT)." },
  { id: "client-code-on-server", text: "Forge or NeoForge loaded client-only code on a dedicated server." },
  { id: "plugin-needs-newer-server", text: "A Bukkit, Spigot or Paper plugin needs a newer API version than the server has." },
  { id: "damaged-file", text: "A jar can't be opened because it looks damaged or incomplete." },
];

export const SWITCH_SAMPLES: Sample[] = [
  {
    id: "before",
    label: "Before",
    code: `curl -X POST https://api.mclo.gs/1/log \\
  --data-urlencode "content@latest.log"`,
  },
  {
    id: "after",
    label: "After",
    code: `curl -X POST ${API_BASE}/1/log \\
  --data-urlencode "content@latest.log"`,
  },
];

export const COMPAT_JSON = JSON.stringify(
  {
    success: true,
    id: ID,
    source: "MyLauncher",
    created: 1790246455,
    expires: 1793702455,
    size: 88012,
    lines: 1204,
    errors: 3,
    url: `${SITE_BASE}/${ID}`,
    raw: `${API_BASE}/1/raw/${ID}`,
    metadata: [],
    token: "Vt3mQ8xZk1cR7pLw0aNe5Yf2HbJdUgS4",
  },
  null,
  2,
);

export const COMPAT_LIMITS_JSON = JSON.stringify(
  {
    storageTime: RETENTION_DAYS * 86400,
    maxLength: MAX_LOG_BYTES,
    maxLines: MAX_LOG_LINES,
  },
  null,
  2,
);

export const COMPAT_ERROR_JSON = JSON.stringify(
  { success: false, error: "This log is too large." },
  null,
  2,
);

export type Support = "Supported" | "Different" | "Not supported" | "Later";

export const COMPAT: {
  method: string;
  path: string;
  support: Support;
  text: string;
}[] = [
  {
    method: "POST",
    path: "/1/log",
    support: "Supported",
    text: "Accepts JSON or form encoding, with content and source. metadata is accepted and ignored, and the response has an empty list. The response has a token field, the delete token, which is shown once. Times are unix seconds.",
  },
  {
    method: "GET",
    path: "/1/log/{id}",
    support: "Supported",
    text: "Same fields as the upload response, without the token. Three switches add a content object: ?raw=1 for content.raw (the text), ?parsed=1 for content.parsed (the log as entries) and ?insights=1 for content.insights (problems and information). They combine, and without any of them there is no content field. 1, true and any other value except 0 and false switch one on.",
  },
  {
    method: "GET",
    path: "/1/raw/{id}",
    support: "Supported",
    text: "The whole log as plain text.",
  },
  {
    method: "GET",
    path: "/1/limits",
    support: "Supported",
    text: "storageTime in seconds, maxLength in bytes and maxLines, with our numbers.",
  },
  {
    method: "GET",
    path: "/1/filters",
    support: "Different",
    text: "Always an empty list. minelog doesn't ask clients to trim or rewrite logs. It only hides private details on its own side.",
  },
  {
    method: "DELETE",
    path: "/1/log/{id}",
    support: "Supported",
    text: `Send the token from the upload as Authorization: Bearer <token>. It works for ${DELETE_WINDOW_MINUTES} minutes after saving, then answers 403. Returns { "success": true }.`,
  },
  {
    method: "POST",
    path: "/1/bulk/log/delete",
    support: "Supported",
    text: `A JSON list of { id, token }, up to ${BULK_DELETE_LIMIT} entries. The answer is 207 with one result per log, each with its own status, so a wrong token or an old log only fails that entry. A list that is empty, too long or malformed is refused whole with 400, and nothing is deleted. Each log follows the ${DELETE_WINDOW_MINUTES} minute delete window.`,
  },
  {
    method: "GET",
    path: "/1/insights/{id}",
    support: "Different",
    text: "Same shape as mclo.gs: name, type, version, title and analysis with problems and information. The details differ: minelog reads more facts (loader, Java, launcher, mods) into information, and its problems list is shorter and pattern-based rather than exhaustive, so it can come back empty on a log mclo.gs would flag something on. Entries show at most 40 lines each.",
  },
  {
    method: "POST",
    path: "/1/analyse",
    support: "Different",
    text: `Reads text without saving it, JSON or form encoded, with content. The answer has the same shape as insights. Private details are hidden before reading, the text can be up to ${MAX_ANALYSE_BYTES / (1024 * 1024)} MB, and a text over the limit is refused, not cut. The entries list mclo.gs adds at the top level isn't sent. Ask GET /1/log/{id}?parsed=1 for entries of a saved log.`,
  },
];

export const OUTLINE: { id: string; label: string }[] = [
  { id: "quick-start", label: "Quick start" },
  { id: "basics", label: "Basics" },
  { id: "limits", label: "Limits" },
  { id: "sources", label: "Identify your app" },
  { id: "privacy", label: "Private details" },
  { id: "create", label: "Save a log" },
  { id: "read", label: "Read a log" },
  { id: "delete", label: "Delete a log" },
  { id: "raw", label: "Get the raw text" },
  { id: "insights", label: "Read what we found" },
  { id: "analyse", label: "Analyse without saving" },
  { id: "get-limits", label: "Read the limits" },
  { id: "errors", label: "Errors" },
  { id: "rate-limits", label: "Rate limits" },
  { id: "mclogs", label: "mclo.gs compatibility" },
  { id: "stability", label: "Stability" },
];

