import assert from "node:assert/strict";
import { test } from "node:test";
import { jsonLdString } from "../src/lib/seo";

const LINE_SEPARATOR = String.fromCharCode(0x2028);
const PARAGRAPH_SEPARATOR = String.fromCharCode(0x2029);

test("structured data can never close the script tag it sits in", () => {
  const hostile = {
    name: "</script><script>alert(1)</script>",
    note: `a & b > c ${LINE_SEPARATOR} d ${PARAGRAPH_SEPARATOR} e`,
  };
  const text = jsonLdString(hostile);
  for (const char of ["<", ">", "&", LINE_SEPARATOR, PARAGRAPH_SEPARATOR]) {
    assert.ok(!text.includes(char), `${JSON.stringify(char)} survived in ${text}`);
  }
  assert.deepEqual(JSON.parse(text), hostile);
});

test("ordinary structured data comes back the same after parsing", () => {
  const data = { "@type": "Question", name: "How long do logs last?", n: 3 };
  assert.deepEqual(JSON.parse(jsonLdString(data)), data);
});
