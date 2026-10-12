import assert from "node:assert/strict";
import test from "node:test";
import { apiHealthFromCheck, siteHealth } from "../src/lib/health";

test("site health says ok with a time and a service name", () => {
  const body = siteHealth();
  assert.equal(body.status, "ok");
  assert.equal(body.service, "site");
  assert.ok(!Number.isNaN(Date.parse(body.time)));
  assert.ok(body.commit === null || /^[0-9a-f]{7}$/.test(body.commit));
});

test("api health is ok when the database answers", () => {
  const body = apiHealthFromCheck({ status: "ok", latencyMs: 12 });
  assert.equal(body.status, "ok");
  assert.equal(body.service, "api");
  assert.equal(body.database.status, "ok");
  assert.equal(body.database.latencyMs, 12);
  assert.ok(!Number.isNaN(Date.parse(body.time)));
});

test("api health is degraded when the database fails", () => {
  const body = apiHealthFromCheck({ status: "error", latencyMs: 4000 });
  assert.equal(body.status, "degraded");
  assert.equal(body.database.status, "error");
});
