import assert from "node:assert/strict";
import { test } from "node:test";
import { GUIDES } from "../src/content/guides";

test("every guide has a unique slug, a matching path and real related links", () => {
  const slugs = GUIDES.map((guide) => guide.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const guide of GUIDES) {
    assert.equal(guide.path, `/guides/${guide.slug}`);
    for (const related of guide.related) {
      assert.ok(slugs.includes(related), `${guide.slug} links to missing ${related}`);
    }
  }
});

test("titles and descriptions fit a search result", () => {
  for (const guide of GUIDES) {
    assert.ok(guide.metaTitle.length <= 60, `${guide.slug} metaTitle is ${guide.metaTitle.length}`);
    assert.ok(guide.description.length <= 160, `${guide.slug} description is ${guide.description.length}`);
    assert.ok(guide.description.length >= 110, `${guide.slug} description is short: ${guide.description.length}`);
  }
});

test("no em dashes, curly quotes or dead internal links in the copy", () => {
  const slugs = new Set(GUIDES.map((guide) => guide.slug));
  const text = JSON.stringify(GUIDES);
  assert.ok(!/[—–“”‘’]/.test(text));
  for (const [, path] of text.matchAll(/\]\((\/[^)#"]*)/g)) {
    if (path.startsWith("/guides/")) assert.ok(slugs.has(path.slice(8)), `dead link ${path}`);
  }
});
