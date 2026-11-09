import assert from "node:assert/strict";
import { test } from "node:test";
import { readInsights } from "../../src/lib/diagnose/insights";

const found = (text: string, id: string) => readInsights(text, "server").problems.filter((p) => p.id === id);
const at = (level: string, message: string) => `[12:00:00] [Server thread/${level}]: ${message}`;

test("a helpful NullPointerException names what was null", () => {
  const [p] = found(
    at("ERROR", 'java.lang.NullPointerException: Cannot invoke "org.bukkit.entity.Player.getName()" because "player" is null'),
    "null-pointer",
  );
  assert.match(p.message, /"player"|player/);
  assert.match(p.message, /was null/);
});

test("different nulls stay separate and a bare NullPointerException is caught too", () => {
  const text = [
    at("ERROR", 'java.lang.NullPointerException: Cannot invoke "A.b()" because "x" is null'),
    at("ERROR", 'java.lang.NullPointerException: Cannot invoke "A.b()" because "y" is null'),
    "Caused by: java.lang.NullPointerException",
  ].join("\n");
  assert.equal(found(text, "null-pointer").length, 3);
});

test("moved too quickly only shows up when it keeps repeating", () => {
  const one = at("WARN", "Steve moved too quickly! 4.5,0.0,2.1");
  assert.equal(found(one, "moved-too-quickly").length, 0);
  const many = Array.from({ length: 6 }, () => one).join("\n");
  assert.equal(found(many, "moved-too-quickly").length, 1);
});

test("resource pack download and hash failures are recognised", () => {
  assert.equal(found(at("WARN", "Failed to download resource pack from https://example.com/pack.zip"), "resource-pack-failed").length, 1);
  assert.equal(found(at("ERROR", "Hash check failed for file pack.zip"), "resource-pack-failed").length, 1);
});

test("duplicate entity UUIDs are recognised in the old and the new wording", () => {
  assert.equal(found(at("WARN", "UUID of added entity already mapped : EntityCow"), "duplicate-entity-uuid").length, 1);
  assert.equal(
    found(
      at("WARN", "Trying to add entity with duplicated UUID 1b2c3d4e-0000-4000-8000-000000000000. Existing minecraft:cow, new: minecraft:cow"),
      "duplicate-entity-uuid",
    ).length,
    1,
  );
});

test("ordinary lines with similar words are left alone", () => {
  for (const line of [
    at("INFO", "Loaded resource pack list"),
    at("INFO", "Checking for null values in config"),
    at("INFO", "Player moved to world_nether"),
  ]) {
    assert.deepEqual(readInsights(line, "server").problems, []);
  }
});
