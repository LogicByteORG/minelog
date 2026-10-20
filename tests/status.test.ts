import assert from "node:assert/strict";
import test from "node:test";
import { STATUS_LABEL, statusFromAggregate } from "../src/lib/status";

test("the status page's own words map to our states", () => {
  assert.equal(statusFromAggregate("operational"), "operational");
  assert.equal(statusFromAggregate("degraded"), "degraded");
  assert.equal(statusFromAggregate("downtime"), "down");
  assert.equal(statusFromAggregate("maintenance"), "maintenance");
});

test("anything unexpected is shown as unknown instead of guessed", () => {
  assert.equal(statusFromAggregate(undefined), "unknown");
  assert.equal(statusFromAggregate("on fire"), "unknown");
  assert.equal(statusFromAggregate(null), "unknown");
});

test("every state has a tooltip", () => {
  for (const label of Object.values(STATUS_LABEL)) assert.ok(label.length > 0);
});
