import assert from "node:assert/strict";
import { test } from "node:test";
import { RETENTION_DAYS, UNHIDDEN_RETENTION_HOURS } from "../src/lib/config";
import { retentionHours, timeLeft } from "../src/lib/retention";

test("hidden logs keep the full retention, unhidden logs only two days", () => {
  assert.equal(retentionHours(true), RETENTION_DAYS * 24);
  assert.equal(retentionHours(false), UNHIDDEN_RETENTION_HOURS);
  assert.equal(UNHIDDEN_RETENTION_HOURS, 48);
  assert.ok(retentionHours(false) < retentionHours(true));
});

test("time left switches from days to hours in the last two days", () => {
  const now = new Date("2026-10-03T12:00:00Z");
  const at = (hours: number) => new Date(now.getTime() + hours * 3_600_000);
  assert.equal(timeLeft(at(0.5), now), "within an hour");
  assert.equal(timeLeft(at(31), now), "in 31 hours");
  assert.equal(timeLeft(at(48), now), "in 48 hours");
  assert.equal(timeLeft(at(49), now), "in 3 days");
  assert.equal(timeLeft(at(24 * 120), now), "in 120 days");
});
