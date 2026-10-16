import assert from "node:assert/strict";
import { test } from "node:test";
import { INLINE_LOG_CHARS, VIEW_CHUNK_LINES } from "../src/lib/config";
import { takeHead } from "../src/lib/log-head";
import { buildLogPage } from "../src/lib/log-page";
import { streamedText } from "../src/lib/service/respond";
import type { StoredLog } from "../src/lib/logs";

const line = (n: number) => `[12:00:${String(n % 60).padStart(2, "0")}] [Server thread/INFO]: line ${n}`;

function bigLog(lines: number): string {
  return Array.from({ length: lines }, (_, i) => line(i)).join("\n");
}

function stored(content: string, kind: StoredLog["kind"] = "server"): StoredLog {
  return {
    id: "abc123",
    content,
    kind,
    lineCount: content.split("\n").length,
    byteSize: Buffer.byteLength(content),
    errorCount: 0,
    warnCount: 0,
    privacyApplied: true,
    source: null,
    createdAt: new Date("2026-10-16T10:00:00Z"),
    expiresAt: new Date("2027-02-13T10:00:00Z"),
  };
}

test("a small log is sent whole", () => {
  const content = bigLog(500);
  assert.ok(content.length < INLINE_LOG_CHARS);
  assert.deepEqual(takeHead(content), { head: content, complete: true });
});

test("a big log is cut on a line boundary and never past the line cap", () => {
  const content = bigLog(30_000);
  assert.ok(content.length > INLINE_LOG_CHARS);
  const { head, complete } = takeHead(content);
  assert.equal(complete, false);
  assert.ok(head.length <= INLINE_LOG_CHARS);
  assert.ok(head.split("\n").length <= VIEW_CHUNK_LINES);
  assert.ok(content.startsWith(head));
  assert.equal(content[head.length], "\n");
  assert.equal(head.split("\n").at(-1), line(head.split("\n").length - 1));
});

test("the head stops at the byte cap when lines are long", () => {
  const long = "x".repeat(10_000);
  const content = Array.from({ length: 200 }, () => long).join("\n");
  const { head, complete } = takeHead(content);
  assert.equal(complete, false);
  assert.ok(head.length <= INLINE_LOG_CHARS);
  assert.equal(head.split("\n").every((part) => part === long), true);
});

test("one huge line is cut at the cap without splitting a surrogate pair", () => {
  const content = "😀".repeat(INLINE_LOG_CHARS);
  const { head, complete } = takeHead(content);
  assert.equal(complete, false);
  assert.ok(head.length <= INLINE_LOG_CHARS);
  assert.equal(head, content.slice(0, head.length));
  const last = head.charCodeAt(head.length - 1);
  assert.ok(!(last >= 0xd800 && last <= 0xdbff));
});

test("a trailing carriage return is not left on the head", () => {
  const content = Array.from({ length: 20_000 }, (_, i) => line(i)).join("\r\n");
  const { head } = takeHead(content);
  assert.ok(!head.endsWith("\r"));
});

test("the page data for a big log carries the head, not the whole text", () => {
  const content = bigLog(30_000);
  const page = buildLogPage(stored(content));
  assert.equal(page.complete, false);
  assert.ok(page.head.length <= INLINE_LOG_CHARS);
  assert.equal(page.lineCount, 30_000);
  assert.equal(page.label, "Server log");
  assert.ok(JSON.stringify(page).length < 1024 * 1024);
});

test("a README is always sent whole, the rendered view needs all of it", () => {
  const content = "# Title\n\n" + "A paragraph of text.\n\n".repeat(30_000);
  const page = buildLogPage(stored(content, "readme"));
  assert.equal(page.complete, true);
  assert.equal(page.head, content);
});

test("the streamed text decodes back to the exact original", async () => {
  const content = "héllo 😀 wörld\n".repeat(80_000);
  const response = streamedText(content);
  assert.equal(response.headers.get("content-type"), "text/plain; charset=utf-8");
  assert.equal(await response.text(), content);
});

test("the streamed text arrives in more than one piece for a big log", async () => {
  const response = streamedText(bigLog(30_000));
  assert.ok(response.body);
  let pieces = 0;
  for await (const piece of response.body as unknown as AsyncIterable<Uint8Array>) {
    if (piece.byteLength > 0) pieces += 1;
  }
  assert.ok(pieces > 1);
});

test("an empty log streams as an empty body", async () => {
  assert.equal(await streamedText("").text(), "");
});
