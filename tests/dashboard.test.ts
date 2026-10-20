import assert from "node:assert/strict";
import test from "node:test";
import { currentTab } from "../src/components/dashboard/nav-items";
import { formatDate } from "../src/lib/time";

test("dates show as ISO days in UTC", () => {
  assert.equal(formatDate(new Date("2026-10-20T23:59:59Z")), "2026-10-20");
});

test("the tab bar marks the page you are on and nothing else", () => {
  assert.equal(currentTab("/dash")?.label, "Overview");
  assert.equal(currentTab("/dash/logs")?.label, "Logs");
  assert.equal(currentTab("/dash/logs/deep")?.label, "Logs");
  assert.equal(currentTab("/dash/alerts")?.label, "Alerts");
  assert.equal(currentTab("/dash/alerts/abc")?.label, "Alerts");
  assert.equal(currentTab("/dash/servers")?.label, "Servers");
  assert.equal(currentTab("/dash/webhooks")?.label, "Webhooks");
  assert.equal(currentTab("/dash/account")?.label, "Account");
  assert.equal(currentTab("/guides"), null);
});
