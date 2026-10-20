import assert from "node:assert/strict";
import test from "node:test";
import { nameShapeProblem, normalizeName } from "../src/lib/display-name";
import { checkNameModeration } from "../src/lib/moderation";

test("names are tidied before they are checked", () => {
  assert.equal(normalizeName("  Grace   Hopper "), "Grace Hopper");
  assert.equal(normalizeName("Ｓｔｅｖｅ"), "Steve");
});

test("a normal name passes the shape check", () => {
  assert.equal(nameShapeProblem("Ada Lovelace"), null);
  assert.equal(nameShapeProblem("Zoë_99"), null);
  assert.equal(nameShapeProblem("a.b-c+d"), null);
});

test("names that are too short, too long or use odd characters are refused", () => {
  assert.ok(nameShapeProblem("A"));
  assert.ok(nameShapeProblem("x".repeat(33)));
  assert.ok(nameShapeProblem("<script>"));
  assert.ok(nameShapeProblem("hey 🔥"));
  assert.ok(nameShapeProblem("-leading"));
});

test("the content filter catches adult names, including disguised ones", () => {
  assert.equal(checkNameModeration("porn star"), true);
  assert.equal(checkNameModeration("p0rn star"), true);
  assert.equal(checkNameModeration("Ada Lovelace"), false);
});
