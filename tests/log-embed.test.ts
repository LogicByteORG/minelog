import assert from "node:assert/strict";
import { test } from "node:test";
import { logEmbedDescription, logEmbedTitle, openGraphFor } from "../src/lib/seo";

test("game logs always name lines, errors and warnings, even at zero", () => {
  assert.equal(
    logEmbedDescription({ kind: "server", lineCount: 1234, errorCount: 0, warnCount: 0 }),
    "1,234 lines, 0 errors, 0 warnings. Shared on minelog.",
  );
  assert.equal(
    logEmbedDescription({ kind: "client", lineCount: 1234, errorCount: 5, warnCount: 12 }),
    "1,234 lines, 5 errors, 12 warnings. Shared on minelog.",
  );
});

test("singular counts read naturally", () => {
  assert.equal(
    logEmbedDescription({ kind: "crash", lineCount: 1, errorCount: 1, warnCount: 1 }),
    "1 line, 1 error, 1 warning. Shared on minelog.",
  );
});

test("config files stay short with just the line count", () => {
  assert.equal(
    logEmbedDescription({ kind: "yaml", lineCount: 86, errorCount: 0, warnCount: 0 }),
    "86 lines. Shared on minelog.",
  );
});

test("log embeds carry no image so Discord renders text only", () => {
  const og = openGraphFor({
    type: "article",
    title: "Server log | abc123",
    description: "10 lines, 0 errors, 0 warnings. Shared on minelog.",
    path: "/abc123",
    images: [],
  });
  assert.deepEqual(og.images, []);
  assert.equal(og.url, "/abc123");
});

test("other pages render text only with no default share image", () => {
  const og = openGraphFor({ title: "Home", description: "Home." });
  assert.deepEqual(og.images, []);
});

test("version and loader join the description up front", () => {
  assert.equal(
    logEmbedDescription({
      kind: "server",
      lineCount: 1234,
      errorCount: 5,
      warnCount: 12,
      gameVersion: "1.20.1",
      loader: "Fabric",
    }),
    "1,234 lines, 5 errors, 12 warnings. Minecraft 1.20.1 on Fabric. Shared on minelog.",
  );
});

test("first problem becomes the likely cause", () => {
  assert.equal(
    logEmbedDescription({
      kind: "server",
      lineCount: 500,
      errorCount: 3,
      warnCount: 1,
      gameVersion: "1.20.1",
      loader: "Paper",
      problem: "The server couldn't use its port, so it didn't start.",
    }),
    "500 lines, 3 errors, 1 warning. Minecraft 1.20.1 on Paper. Likely cause: The server couldn't use its port, so it didn't start. Shared on minelog.",
  );
});

test("long problems are clipped so the card stays readable", () => {
  const text = logEmbedDescription({
    kind: "crash",
    lineCount: 900,
    errorCount: 9,
    warnCount: 0,
    problem: `Out of memory ${"and still going ".repeat(40)}`,
  });
  assert.ok(text.length <= 300);
  assert.ok(text.endsWith("Shared on minelog."));
  assert.ok(text.includes("Likely cause:"));
});

test("descriptions never use em dashes", () => {
  const text = logEmbedDescription({
    kind: "server",
    lineCount: 10,
    errorCount: 1,
    warnCount: 0,
    gameVersion: "1.21",
    loader: "NeoForge",
    problem: "Java ran out of the memory it was allowed to use.",
  });
  assert.ok(!text.includes("—") && !text.includes("–"));
});

test("titles carry the version when it is known", () => {
  assert.equal(
    logEmbedTitle({ label: "Server log", id: "abc123", gameVersion: "1.20.1", loader: "Fabric" }),
    "Server log 1.20.1 on Fabric | abc123",
  );
  assert.equal(logEmbedTitle({ label: "Server log", id: "abc123" }), "Server log | abc123");
});
