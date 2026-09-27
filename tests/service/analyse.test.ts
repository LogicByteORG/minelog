import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  ANALYSES_PER_MINUTE,
  BULK_DELETES_PER_MINUTE,
  DELETES_PER_MINUTE,
  INSIGHT_READS_PER_MINUTE,
  MAX_ANALYSE_BYTES,
  MAX_LOG_LINES,
} from "../../src/lib/config";
import { readInsights } from "../../src/lib/diagnose/insights";
import { analyseText, guardInsightRead, readAnalyseBody } from "../../src/lib/service/analyse";
import { BodyError } from "../../src/lib/service/body";
import { tooManyDeletes } from "../../src/lib/service/delete";
import { waitFor } from "../../src/lib/service/rate";
import {
  describeCompatContentInsights,
  describeCompatInsights,
  describeV2Insights,
} from "../../src/lib/service/describe-insights";
import { queryFlag, readFields } from "../../src/lib/service/fields";
import { takeHit } from "../../src/lib/service/limiter";
import { UploadError } from "../../src/lib/service/upload";

process.env.IP_HASH_SECRET ??= "test-secret";

const fixture = (name: string) =>
  readFileSync(new URL(`../fixtures/${name}`, import.meta.url), "utf8");

let next = 0;
const address = () => `10.9.0.${(next += 1)}`;

const post = (body: string, ip: string) =>
  new Request("http://localhost/v2/analyse", {
    method: "POST",
    body,
    headers: { "x-forwarded-for": ip },
  });

const analyse = (content: unknown, hidePrivate?: unknown) => analyseText({ content, hidePrivate });

function refusal(run: () => unknown): UploadError {
  try {
    run();
  } catch (error) {
    assert.ok(error instanceof UploadError, String(error));
    return error;
  }
  assert.fail("expected the call to be refused");
}

const PAPER = fixture("synthetic-paper-server-1.20.1.log");

test("a Paper log is analysed", () => {
  const insights = analyse(PAPER);
  assert.equal(insights.title, "Paper 1.20.1 Server Log");
});

test("empty, missing and wrongly typed input is refused with plain words", () => {
  for (const content of ["", "   \n", undefined, 42, null, ["a"]]) {
    const error = refusal(() => analyse(content));
    assert.equal(error.status, 400);
    assert.equal(error.code, "empty_content");
    assert.equal(error.message, "There is no log text in this request.");
  }
  const bad = refusal(() => analyse(PAPER, "yes"));
  assert.equal(bad.code, "invalid_option");
});

test("binary text is refused", () => {
  const error = refusal(() => analyse("abc\u0000def"));
  assert.equal(error.status, 400);
  assert.equal(error.code, "not_plain_text");
});

test("too many bytes and too many lines get 413", () => {
  const big = refusal(() => analyse("a".repeat(MAX_ANALYSE_BYTES + 1)));
  assert.equal(big.status, 413);
  assert.equal(big.code, "log_too_large");
  assert.equal(big.message, "This log is too large to analyse. The limit is 5 MB.");

  const long = refusal(() => analyse("x\n".repeat(MAX_LOG_LINES + 1)));
  assert.equal(long.status, 413);
  assert.equal(long.code, "too_many_lines");

  assert.doesNotThrow(() => analyse("x\n".repeat(MAX_LOG_LINES)));
});

test("private details are hidden before reading, unless the caller opts out", () => {
  const text = "[12:00:00] [Server thread/INFO]: /203.0.113.7:5555 lost connection\n";
  const hidden = analyse(text).entryAt(1).lines[0].content;
  assert.doesNotMatch(hidden, /203\.0\.113\.7/);
  assert.match(hidden, /\[redacted\]/);

  const shown = analyse(text, false).entryAt(1).lines[0].content;
  assert.match(shown, /203\.0\.113\.7/);
});

test("one connection can only analyse so often, and is told when to come back", async () => {
  const ip = address();
  for (let i = 0; i < ANALYSES_PER_MINUTE; i += 1) {
    assert.equal(await readAnalyseBody(post(PAPER, ip)), PAPER);
  }
  await assert.rejects(readAnalyseBody(post(PAPER, ip)), (error) => {
    assert.ok(error instanceof UploadError);
    assert.equal(error.status, 429);
    assert.equal(error.code, "rate_limited");
    assert.ok(error.retryAfter && error.retryAfter >= 1 && error.retryAfter <= 60);
    assert.match(error.message, /^Too many analyses from this connection\. Try again in \d+ seconds\.$/);
    return true;
  });

  assert.equal(await readAnalyseBody(post(PAPER, address())), PAPER);
});

test("a body over the analyse cap is refused, and still counts against the limit", async () => {
  const ip = address();
  const huge = "a".repeat(MAX_ANALYSE_BYTES * 2 + 1);
  await assert.rejects(
    readAnalyseBody(post(huge, ip)),
    (error) => error instanceof BodyError && error.problem === "too_large",
  );

  for (let i = 0; i < ANALYSES_PER_MINUTE - 1; i += 1) await readAnalyseBody(post("x", ip));
  await assert.rejects(
    readAnalyseBody(post("x", ip)),
    (error) => error instanceof UploadError && error.status === 429,
  );
});

test("the kind comes from the text as sent, not from the hidden copy", () => {
  const text = [
    "[12:00:00] [main/INFO]: Setting user: Steve",
    "[12:00:00] [Render thread/INFO]: Backend library: LWJGL version 3.3.3",
    "[12:00:01] [main/INFO]: /203.0.113.7:25565",
  ].join("\n");
  assert.equal(analyse(text).kind, "client");
  assert.equal(analyse(text, false).kind, "client");
});

test("reading findings, deleting and bulk deleting each have a limit of their own", () => {
  const request = (ip: string) =>
    new Request("http://localhost/x", { method: "POST", headers: { "x-forwarded-for": ip } });

  const ip = address();
  for (let i = 0; i < INSIGHT_READS_PER_MINUTE; i += 1) guardInsightRead(request(ip));
  const refused = refusal(() => guardInsightRead(request(ip)));
  assert.equal(refused.status, 429);
  assert.equal(refused.code, "rate_limited");
  assert.match(refused.message, /^Too many requests for findings from this connection\. Try again in \d+ seconds\.$/);

  assert.equal(waitFor(request(ip), "delete", DELETES_PER_MINUTE), null);
  for (let i = 1; i < DELETES_PER_MINUTE; i += 1) waitFor(request(ip), "delete", DELETES_PER_MINUTE);
  const wait = waitFor(request(ip), "delete", DELETES_PER_MINUTE);
  assert.ok(wait !== null && wait >= 1 && wait <= 60);

  const error = tooManyDeletes(wait!);
  assert.equal(error.status, 429);
  assert.equal(error.code, "rate_limited");
  assert.equal(error.retryAfter, wait);
  assert.match(error.message, /^Too many delete requests from this connection\. Try again in \d+ seconds\.$/);

  assert.equal(waitFor(request(address()), "bulk-delete", BULK_DELETES_PER_MINUTE), null);
});

test("a full limiter drops the oldest key, not everyone's counts", () => {
  const now = 5_000_000;
  takeHit("keeper", 1, now);
  for (let i = 0; i < 10_000; i += 1) takeHit(`flood-${i}`, 1, now);
  assert.equal(takeHit("flood-9999", 1, now).ok, false);
});

test("the limiter counts per key and starts over after a minute", () => {
  const now = 1_000_000;
  assert.deepEqual(takeHit("k", 2, now), { ok: true });
  assert.deepEqual(takeHit("k", 2, now + 1), { ok: true });
  const blocked = takeHit("k", 2, now + 2_000);
  assert.equal(blocked.ok, false);
  assert.equal(blocked.ok === false && blocked.retryAfter, 58);
  assert.deepEqual(takeHit("other", 2, now + 2_000), { ok: true });
  assert.deepEqual(takeHit("k", 2, now + 60_001), { ok: true });
});

test("request fields come from JSON or, for older tools, a form", () => {
  assert.deepEqual(readFields('{"content":"a","hidePrivate":false}', "application/json"), {
    content: "a",
    hidePrivate: false,
  });
  assert.deepEqual(readFields("content=a%0Ab", "application/x-www-form-urlencoded"), { content: "a\nb" });
  assert.equal(readFields("not json", "application/json"), null);
  assert.equal(readFields("[1]", "application/json"), null);
  assert.equal(readFields("null", "application/json"), null);
  assert.equal(queryFlag("true"), true);
  assert.equal(queryFlag("false"), false);
  assert.equal(queryFlag(null), undefined);
  assert.equal(queryFlag("maybe"), "maybe");
});

const CRASHY = [
  "[12:00:00 INFO]: Starting minecraft server version 1.20.1",
  "[12:00:01 ERROR]: Could not load 'plugins/Foo.jar' in folder 'plugins'",
  "org.bukkit.plugin.InvalidPluginException: Unsupported API version 1.21",
  "\tat org.bukkit.plugin.java.JavaPluginLoader.loadPlugin(JavaPluginLoader.java:100)",
].join("\n");

test("the mclo.gs answer has the same fields and types", () => {
  const body = describeCompatInsights(readInsights(CRASHY, "server"));
  assert.deepEqual(Object.keys(body), ["success", "id", "name", "type", "version", "title", "analysis"]);
  assert.equal(body.success, true);
  assert.equal(body.id, "vanilla/server");
  assert.equal(body.name, "Vanilla");
  assert.equal(body.type, "Server Log");
  assert.equal(body.version, "1.20.1");
  assert.equal(body.title, "Vanilla 1.20.1 Server Log");
  assert.deepEqual(Object.keys(body.analysis), ["problems", "information"]);

  const [problem] = body.analysis.problems;
  assert.deepEqual(Object.keys(problem), ["message", "counter", "entry", "solutions"]);
  assert.equal(problem.counter, 1);
  assert.ok(problem.solutions.every((s) => Object.keys(s).join() === "message"));
  assert.deepEqual(Object.keys(problem.entry), ["level", "time", "prefix", "lines"]);
  assert.equal(problem.entry.level, 3);
  assert.equal(problem.entry.prefix, "[12:00:01 ERROR]:");
  assert.deepEqual(
    problem.entry.lines.map((l) => l.number),
    [2, 3, 4],
  );

  const [info] = body.analysis.information;
  assert.deepEqual(Object.keys(info), ["message", "counter", "label", "value", "entry"]);
  assert.equal(info.message, "Minecraft version: 1.20.1");
  assert.equal(info.label, "Minecraft version");
  assert.equal(info.value, "1.20.1");
  assert.equal(info.entry.lines[0].number, 1);
  assert.deepEqual(JSON.parse(JSON.stringify(body)), body);
});

test("the content insights are just the analysis part", () => {
  const insights = readInsights(CRASHY, "server");
  assert.deepEqual(describeCompatContentInsights(insights), describeCompatInsights(insights).analysis);
});

test("an unknown file answers with empty lists and its own name", () => {
  const body = describeCompatInsights(readInsights("hello there", "unknown"));
  assert.equal(body.id, "unknown/unknown");
  assert.equal(body.title, "Custom");
  assert.deepEqual(body.analysis, { problems: [], information: [] });
});

test("the v2 answer carries facts with confidence and lines, and problems with advice", () => {
  const body = describeV2Insights(readInsights(fixture("synthetic-paper-server-1.20.1.log"), "server"));
  assert.equal(body.kind, "server");
  assert.equal(body.minecraftVersion, "1.20.1");
  assert.equal(body.environment.loader?.value, "paper");
  assert.equal(body.environment.loader?.text, "Paper build 196");
  assert.equal(body.environment.loader?.confidence, "medium");
  assert.deepEqual(body.environment.loader?.lines, [3]);
  assert.equal(body.environment.java, null);
  assert.deepEqual(body.environment.conflicts, []);
  assert.deepEqual(
    body.mods.map((m) => [m.kind, m.name, m.version]),
    [
      ["plugin", "Essentials", "2.20.1"],
      ["plugin", "WorldEdit", "7.2.15+6c8c8a7"],
    ],
  );

  const withProblem = describeV2Insights(readInsights(CRASHY, "server"));
  assert.equal(withProblem.problems[0].id, "plugin-needs-newer-server");
  assert.equal(withProblem.problems[0].line, 3);
  assert.ok(withProblem.problems[0].solutions.length >= 2);
});

