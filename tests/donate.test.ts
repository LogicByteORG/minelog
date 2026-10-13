import assert from "node:assert/strict";
import test from "node:test";
import { DONATE_AFTER_SAVES, shouldShowDonateNudge } from "../src/lib/donate";

test("the nudge stays quiet for new visitors and dismissed ones", () => {
  assert.equal(shouldShowDonateNudge(0, false), false);
  assert.equal(shouldShowDonateNudge(DONATE_AFTER_SAVES - 1, false), false);
  assert.equal(shouldShowDonateNudge(DONATE_AFTER_SAVES, true), false);
  assert.equal(shouldShowDonateNudge(DONATE_AFTER_SAVES + 10, true), false);
});

test("the nudge shows from the third save until it is dismissed", () => {
  assert.equal(shouldShowDonateNudge(DONATE_AFTER_SAVES, false), true);
  assert.equal(shouldShowDonateNudge(DONATE_AFTER_SAVES + 10, false), true);
});
