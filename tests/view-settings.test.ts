import assert from "node:assert/strict";
import { test } from "node:test";
import { DEFAULT_SETTINGS, parseViewSettings } from "../src/lib/use-view-settings";

test("saved view settings that are not an object fall back to the defaults", () => {
  for (const raw of ["null", "5", "true", '"text"', "[1,2]", "{", "", "undefined"]) {
    assert.deepEqual(parseViewSettings(raw), DEFAULT_SETTINGS, raw);
  }
});

test("only valid values are taken from saved view settings", () => {
  const saved = JSON.stringify({ wrap: true, lineNumbers: "yes", textSize: "large", spacing: "wide" });
  assert.deepEqual(parseViewSettings(saved), {
    ...DEFAULT_SETTINGS,
    wrap: true,
    textSize: "large",
  });
});
