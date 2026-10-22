import assert from "node:assert/strict";
import test from "node:test";
import { readableIp } from "../src/lib/ip-label";

test("addresses that say nothing are left out", () => {
  assert.equal(readableIp("0000:0000:0000:0000:0000:0000:0000:0000"), null);
  assert.equal(readableIp("::"), null);
  assert.equal(readableIp("::1"), null);
  assert.equal(readableIp("127.0.0.1"), null);
  assert.equal(readableIp("::ffff:127.0.0.1"), null);
  assert.equal(readableIp(""), null);
  assert.equal(readableIp(null), null);
});

test("real addresses stay and long IPv6 ones are shortened", () => {
  assert.equal(readableIp("203.0.113.7"), "203.0.113.7");
  assert.equal(readableIp("::ffff:203.0.113.7"), "203.0.113.7");
  assert.equal(readableIp("2001:0db8:0000:0000:0000:0000:0000:0001"), "2001:db8::1");
});

test("text that is not an address is dropped", () => {
  assert.equal(readableIp("not an ip: at all"), null);
});
