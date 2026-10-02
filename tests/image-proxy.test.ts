import assert from "node:assert/strict";
import test from "node:test";
import { proxyUrl } from "../src/lib/image-check";

test("https and http addresses get their documented proxy form", () => {
  assert.equal(
    proxyUrl("https://example.com/shots/title.png"),
    "https://wsrv.nl/?url=https://example.com/shots/title.png",
  );
  assert.equal(
    proxyUrl("http://example.com/shots/title.png"),
    "https://wsrv.nl/?url=example.com/shots/title.png",
  );
});

test("query strings are encoded and fragments are dropped", () => {
  assert.equal(
    proxyUrl("https://example.com/img.png?size=large&theme=dark"),
    "https://wsrv.nl/?url=https://example.com/img.png%3Fsize=large%26theme=dark",
  );
  assert.equal(
    proxyUrl("https://example.com/img.png#frag"),
    "https://wsrv.nl/?url=https://example.com/img.png",
  );
});

test("badges, inline pictures and overlong addresses stay direct", () => {
  assert.equal(proxyUrl("https://example.com/badge.svg"), null);
  assert.equal(proxyUrl("https://example.com/a.svg?x=1"), null);
  assert.equal(proxyUrl("data:image/png;base64,AAA"), null);
  assert.equal(proxyUrl("/shots/title.png"), null);
  assert.equal(proxyUrl(""), null);
  assert.equal(proxyUrl(`https://example.com/${"a".repeat(2000)}.png`), null);
});
