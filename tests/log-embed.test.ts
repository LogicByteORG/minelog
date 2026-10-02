import assert from "node:assert/strict";
import { test } from "node:test";
import { logEmbedDescription, openGraphFor } from "../src/lib/seo";

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
