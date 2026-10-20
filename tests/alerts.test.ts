import assert from "node:assert/strict";
import test from "node:test";
import { alertFingerprint, leadLine, summaryOf } from "../src/lib/alert-fingerprint";

const first = [
  "[12:00:01] [Server thread/INFO]: Saving chunks",
  "[12:00:02] [Server thread/ERROR]: Could not pass event PlayerJoinEvent to Foo v1.4.2 for player 3f2b1c9e-8a4d-4b1e-9c3a-1d2e3f4a5b6c",
  "\tat org.foo.Plugin.onJoin(Plugin.java:42)",
  "\tat org.bukkit.plugin.EventExecutor.execute(EventExecutor.java:74)",
].join("\n");

const later = [
  "[18:45:59] [Server thread/ERROR]: Could not pass event PlayerJoinEvent to Foo v1.4.2 for player 11111111-2222-3333-4444-555555555555",
  "\tat org.foo.Plugin.onJoin(Plugin.java:57)",
  "\tat org.bukkit.plugin.EventExecutor.execute(EventExecutor.java:99)",
].join("\n");

test("the same error at a different time is the same alert", () => {
  assert.equal(alertFingerprint(first), alertFingerprint(later));
});

test("a different error is a different alert", () => {
  const other = "[12:00:02] [Server thread/ERROR]: Could not load plugin Bar\n\tat org.bar.Main.load(Main.java:10)";
  assert.notEqual(alertFingerprint(first), alertFingerprint(other));
  const sameLineOtherStack = first.replace("org.foo.Plugin.onJoin", "org.foo.Other.run");
  assert.notEqual(alertFingerprint(first), alertFingerprint(sameLineOtherStack));
});

test("player names, addresses and ids do not split one error into many", () => {
  const a = "[10:00:00] [Server thread/ERROR]: Connection from 203.0.113.7:51234 failed after 5012 ms";
  const b = "[11:30:09] [Server thread/ERROR]: Connection from 198.51.100.20:60001 failed after 87 ms";
  assert.equal(alertFingerprint(a), alertFingerprint(b));
});

test("the summary is the error line, not the stack trace or the noise before it", () => {
  assert.equal(
    leadLine(first),
    "[12:00:02] [Server thread/ERROR]: Could not pass event PlayerJoinEvent to Foo v1.4.2 for player 3f2b1c9e-8a4d-4b1e-9c3a-1d2e3f4a5b6c",
  );
  assert.ok(summaryOf(first).startsWith("[12:00:02]"));
  assert.ok(summaryOf("x".repeat(500)).length <= 200);
  assert.equal(summaryOf(""), "");
});

test("a log with no obvious error still gets a stable fingerprint", () => {
  assert.equal(alertFingerprint("something odd happened"), alertFingerprint("something odd happened"));
  assert.equal(alertFingerprint("").length, 32);
});
