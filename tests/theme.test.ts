import assert from "node:assert/strict";
import test from "node:test";
import { effectiveTheme, parseTheme } from "../src/lib/theme";

test("theme choices only accept the two known names", () => {
  assert.equal(parseTheme("light"), "light");
  assert.equal(parseTheme("dark"), "dark");
  assert.equal(parseTheme(null), null);
  assert.equal(parseTheme(""), null);
  assert.equal(parseTheme("system"), null);
  assert.equal(parseTheme("LIGHT"), null);
});

test("without a saved choice the system decides", () => {
  assert.equal(effectiveTheme(null, false), "light");
  assert.equal(effectiveTheme(null, true), "dark");
  assert.equal(effectiveTheme("light", true), "light");
  assert.equal(effectiveTheme("dark", false), "dark");
});
