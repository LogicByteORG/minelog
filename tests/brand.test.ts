import assert from "node:assert/strict";
import test from "node:test";
import { brandMark, knownBrands } from "../src/lib/brand";

test("brand marks ship inline with path data", () => {
  assert.deepEqual([...knownBrands()].sort(), ["buymeacoffee", "github", "modrinth"]);
  for (const slug of knownBrands()) {
    const mark = brandMark(slug);
    assert.ok(mark.title.length > 0);
    assert.ok(mark.path.length > 100);
    assert.ok(!mark.path.includes("<") && !mark.path.includes(">"));
  }
});
