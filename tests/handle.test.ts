import assert from "node:assert/strict";
import test from "node:test";
import { parseTargets } from "../src/lib/event-input";
import { HANDLE_MAX, handleFromName, normalizeHandle, uniqueHandle } from "../src/lib/handle";

test("a handle is made from the name", () => {
  assert.equal(handleFromName("Ops Discord"), "ops-discord");
  assert.equal(handleFromName("  #alerts  (prod) "), "alerts-prod");
  assert.equal(handleFromName("Çalışma Kanalı"), "calisma-kanali");
  assert.equal(handleFromName("!!!"), "webhook");
  assert.equal(handleFromName(""), "webhook");
  assert.ok(handleFromName("a".repeat(80)).length <= 28);
});

test("a handle that is already taken gets a number", () => {
  assert.equal(uniqueHandle("ops", []), "ops");
  assert.equal(uniqueHandle("ops", ["ops"]), "ops-2");
  assert.equal(uniqueHandle("ops", ["ops", "ops-2", "ops-3"]), "ops-4");
  const long = "a".repeat(28);
  assert.ok(uniqueHandle(long, [long]).length <= HANDLE_MAX);
});

test("only plain lowercase handles are accepted", () => {
  assert.equal(normalizeHandle("Ops-Discord"), "ops-discord");
  assert.equal(normalizeHandle("a"), "a");
  assert.equal(normalizeHandle("-bad"), null);
  assert.equal(normalizeHandle("bad-"), null);
  assert.equal(normalizeHandle("has space"), null);
  assert.equal(normalizeHandle("a".repeat(33)), null);
  assert.equal(normalizeHandle(""), null);
  assert.equal(normalizeHandle(5), null);
});

test("a script can name one webhook or a few", () => {
  assert.deepEqual(parseTargets(undefined), { ok: true, handles: undefined });
  assert.deepEqual(parseTargets("ops-discord"), { ok: true, handles: ["ops-discord"] });
  assert.deepEqual(parseTargets(["Ops", "ops", "lobby"]), { ok: true, handles: ["ops", "lobby"] });
});

test("a bad webhook list is refused with a reason", () => {
  for (const value of [[], ["bad handle"], [5], "x y", Array(11).fill("a"), {}]) {
    const result = parseTargets(value);
    assert.equal(result.ok, false);
  }
});
