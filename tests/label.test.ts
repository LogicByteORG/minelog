import assert from "node:assert/strict";
import test from "node:test";
import { sameName, uniqueName } from "../src/lib/label";

test("names match whatever the case or the spacing around them", () => {
  assert.ok(sameName("Ops Discord", "ops discord"));
  assert.ok(sameName("  Lobby ", "lobby"));
  assert.ok(!sameName("Lobby", "Lobby 2"));
});

test("a taken name gets the next free number", () => {
  assert.equal(uniqueName("Paper 1.21.8", []), "Paper 1.21.8");
  assert.equal(uniqueName("Paper 1.21.8", ["Paper 1.21.8"]), "Paper 1.21.8 2");
  assert.equal(uniqueName("Paper 1.21.8", ["paper 1.21.8", "Paper 1.21.8 2"]), "Paper 1.21.8 3");
});

test("a long name still fits once the number is added", () => {
  const long = "x".repeat(40);
  const next = uniqueName(long, [long], 40);
  assert.ok(next.length <= 40);
  assert.ok(next.endsWith(" 2"));
});
