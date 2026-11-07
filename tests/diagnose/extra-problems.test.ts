import assert from "node:assert/strict";
import { test } from "node:test";
import { readInsights } from "../../src/lib/diagnose/insights";

const found = (text: string, id: string) => readInsights(text, "server").problems.filter((p) => p.id === id);
const at = (level: string, message: string) => `[12:00:00] [Server thread/${level}]: ${message}`;

test("a failing plugin task names the plugin and its version", () => {
  const [p] = found(at("ERROR", "Task #4021 for Essentials v2.20.1 generated an exception"), "plugin-task-error");
  assert.match(p.message, /Essentials v2\.20\.1/);
});

test("two different plugins with failing tasks stay separate", () => {
  const text = [
    at("ERROR", "Task #1 for AlphaPlugin v1.0 generated an exception"),
    at("ERROR", "Task #2 for BetaPlugin v2.0 generated an exception"),
  ].join("\n");
  assert.equal(found(text, "plugin-task-error").length, 2);
});

test("a stack overflow and a concurrent modification are each reported once however often they repeat", () => {
  const text = Array.from({ length: 5 }, () =>
    [at("ERROR", "java.lang.StackOverflowError"), at("ERROR", "java.util.ConcurrentModificationException: null")].join("\n"),
  ).join("\n");
  assert.equal(found(text, "stack-overflow").length, 1);
  assert.equal(found(text, "concurrent-modification").length, 1);
});

test("a missing main class names the class", () => {
  const [p] = found("Error: Could not find or load main class net.minecraft.server.Main", "main-class-missing");
  assert.match(p.message, /net\.minecraft\.server\.Main/);
});

test("a world from a newer version says not to open it in an older one", () => {
  const [p] = found(
    at("ERROR", "java.lang.RuntimeException: Server attempted to load chunk saved with newer version of minecraft! 3955 > 3839"),
    "world-newer-version",
  );
  assert.ok(p.solutions.some((s) => /copy of the world/.test(s)));
});

test("failed registries and a bad bind address each get an answer", () => {
  assert.equal(found(at("ERROR", "Failed to load registries due to above errors"), "registries-failed").length, 1);
  const [p] = found(at("ERROR", "java.net.BindException: Cannot assign requested address"), "bind-address");
  assert.ok(p.solutions.some((s) => s.includes("server-ip")));
});

test("ordinary lines that mention similar words are left alone", () => {
  for (const line of [
    at("INFO", "Task scheduled for Essentials"),
    at("INFO", "Saved stack of 64 items"),
    at("INFO", "Loaded registries successfully"),
  ]) {
    assert.deepEqual(readInsights(line, "server").problems, []);
  }
});
