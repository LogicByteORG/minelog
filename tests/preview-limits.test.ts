import assert from "node:assert/strict";
import { test } from "node:test";
import {
  MAX_LOG_BYTES,
  MAX_LOG_LINES,
  PREVIEW_RETENTION_HOURS,
  RETENTION_DAYS,
  UNHIDDEN_RETENTION_HOURS,
} from "../src/lib/config";
import { apiRootBody, compatLimitsBody, v2LimitsBody } from "../src/lib/service/limits";

test("the api root matches the public shape, preview flag only on previews", () => {
  const live = apiRootBody("https://minelog.org", false);
  assert.deepEqual(live, {
    name: "minelog API",
    docs: "https://minelog.org/api",
    protocols: { v2: "/v2", mclogs: "/1" },
    limits: "/v2/limits",
  });
  assert.ok(!("preview" in live));

  const preview = apiRootBody("https://minelog.org", true);
  assert.equal(preview.preview, true);
  assert.equal(Object.keys(preview)[0], "preview");
  assert.equal(preview.name, "minelog API");
});

test("preview limits overwrite the site clocks to one hour", () => {
  const live = v2LimitsBody(false);
  assert.equal(live.retentionDays, RETENTION_DAYS);
  assert.equal(live.unhiddenRetentionHours, UNHIDDEN_RETENTION_HOURS);
  assert.ok(!("retentionHours" in live));

  const preview = v2LimitsBody(true);
  assert.equal(preview.retentionDays, 0);
  assert.equal(preview.retentionHours, PREVIEW_RETENTION_HOURS);
  assert.equal(preview.unhiddenRetentionHours, PREVIEW_RETENTION_HOURS);
  assert.equal(preview.maxBytes, live.maxBytes);
  assert.equal(preview.maxLines, live.maxLines);

  assert.equal(compatLimitsBody(false).storageTime, RETENTION_DAYS * 86400);
  assert.equal(compatLimitsBody(true).storageTime, PREVIEW_RETENTION_HOURS * 3600);
  assert.equal(compatLimitsBody(true).maxLength, MAX_LOG_BYTES);
  assert.equal(compatLimitsBody(true).maxLines, MAX_LOG_LINES);
});
