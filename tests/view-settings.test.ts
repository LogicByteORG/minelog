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

test("new view settings fall back to defaults on bad values", () => {
  const saved = JSON.stringify({
    hideChat: "yes",
    hideEmpty: 1,
    markedOnly: null,
    linkify: true,
    fontFamily: "comic-sans",
  });
  assert.deepEqual(parseViewSettings(saved), {
    ...DEFAULT_SETTINGS,
    linkify: true,
  });
});

test("new view settings round-trip", () => {
  const saved = JSON.stringify({
    hideChat: true,
    hideEmpty: true,
    markedOnly: true,
    linkify: true,
    fontFamily: "fira-code",
  });
  const parsed = parseViewSettings(saved);
  assert.equal(parsed.hideChat, true);
  assert.equal(parsed.hideEmpty, true);
  assert.equal(parsed.markedOnly, true);
  assert.equal(parsed.linkify, true);
  assert.equal(parsed.fontFamily, "fira-code");
});

test("wrap stays off in the parsed defaults whatever the screen says", () => {
  const holder = globalThis as { window?: unknown };
  const before = holder.window;
  holder.window = { matchMedia: () => ({ matches: true }) };
  try {
    assert.equal(parseViewSettings("").wrap, false);
    assert.equal(parseViewSettings(JSON.stringify({ wrap: false })).wrap, false);
  } finally {
    if (before === undefined) delete holder.window;
    else holder.window = before;
  }
});
