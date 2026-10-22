import assert from "node:assert/strict";
import test from "node:test";
import { exportDocument, type ExportInput } from "../src/lib/export-data";

const WHEN = new Date("2026-10-22T10:00:00Z");

const input: ExportInput = {
  user: { name: "Pozi", email: "pozi@example.com", createdAt: WHEN },
  linked: [],
  logs: [
    {
      id: "abc123",
      isPrivate: true,
      typeLabel: "Server log",
      lineCount: 10,
      errorCount: 1,
      warnCount: 2,
      createdAt: WHEN,
      expiresAt: WHEN,
    },
  ],
  servers: [
    {
      id: "s1",
      name: "Lobby",
      nameIsCustom: true,
      keyPrefix: "mlk_secretprefix",
      software: "Paper",
      softwareVersion: "1.21.8",
      pluginVersion: "1.2.1",
      createdAt: WHEN,
      lastSeenAt: null,
    },
  ],
  webhooks: [
    {
      id: "w1",
      name: "Ops",
      handle: "ops",
      kind: "discord",
      urlHint: "discord.com/api/webhooks/12…",
      serverIds: ["s1"],
      enabled: true,
      failureCount: 0,
      lastStatus: "ok",
      lastAttemptAt: WHEN,
      lastError: null,
      createdAt: WHEN,
    },
    {
      id: "w2",
      name: "Everything",
      handle: "everything",
      kind: "slack",
      urlHint: "hooks.slack.com/services/T0…",
      serverIds: null,
      enabled: false,
      failureCount: 0,
      lastStatus: null,
      lastAttemptAt: null,
      lastError: null,
      createdAt: WHEN,
    },
  ],
  alerts: [],
  base: "https://minelog.org",
  now: WHEN,
};

test("private logs link to their private address", () => {
  const document = exportDocument(input);
  assert.equal(document.logs[0].url, "https://minelog.org/p/abc123");
});

test("webhooks name their servers or say all", () => {
  const { webhooks } = exportDocument(input);
  assert.deepEqual(webhooks[0].servers, ["Lobby"]);
  assert.equal(webhooks[1].servers, "all");
});

test("secrets stay out of the export", () => {
  const text = JSON.stringify(exportDocument(input));
  assert.ok(!text.includes("mlk_secretprefix"));
  assert.ok(!text.includes("keyPrefix"));
  assert.ok(!text.includes("url_encrypted"));
});
