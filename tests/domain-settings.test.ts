import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DNS_TARGET,
  checkDomain,
  dnsRecords,
  domainUrl,
  isOwnHost,
} from "../src/lib/domain-settings";

test("a pasted address is cleaned down to the host", () => {
  assert.deepEqual(checkDomain(" HTTPS://Logs.MineShire.com/some/path?x=1 "), {
    ok: true,
    host: "logs.mineshire.com",
  });
  assert.deepEqual(checkDomain("log.mineshire.com."), { ok: true, host: "log.mineshire.com" });
});

test("root domains, addresses and junk are refused", () => {
  assert.equal(checkDomain("").ok, false);
  assert.equal(checkDomain("mineshire.com").ok, false);
  assert.equal(checkDomain("10.0.0.1").ok, false);
  assert.equal(checkDomain("log.mineshire.com:8080").ok, false);
  assert.equal(checkDomain("-bad.mineshire.com").ok, false);
  assert.equal(checkDomain("log mineshire.com").ok, false);
  assert.equal(checkDomain("a.b.123").ok, false);
  assert.equal(checkDomain(42).ok, false);
});

test("minelog's own names and platform hosts are refused", () => {
  assert.equal(checkDomain("logs.minelog.org").ok, false);
  assert.equal(checkDomain("api.minelog.org").ok, false);
  assert.equal(checkDomain("my-app.vercel.app").ok, false);
  assert.equal(checkDomain("x.y.localhost").ok, false);
});

test("records start with the CNAME and add any ownership TXT", () => {
  assert.deepEqual(dnsRecords("log.mineshire.com", null), [
    { type: "CNAME", name: "log.mineshire.com", value: DNS_TARGET },
  ]);
  const records = dnsRecords("log.mineshire.com", "abc.vercel-dns-017.com", [
    { type: "TXT", domain: "_vercel.mineshire.com", value: "vc-domain-verify=log.mineshire.com,123" },
    { type: "A", domain: "x", value: "y" },
  ]);
  assert.equal(records.length, 2);
  assert.equal(records[0].value, "abc.vercel-dns-017.com");
  assert.equal(records[1].type, "TXT");
});

test("own hosts are told apart from customer hosts", () => {
  assert.equal(isOwnHost("minelog.org", []), true);
  assert.equal(isOwnHost("api.minelog.org", []), true);
  assert.equal(isOwnHost("localhost:3000", []), true);
  assert.equal(isOwnHost("minelog-git-x.vercel.app", []), true);
  assert.equal(isOwnHost("log.mineshire.com", []), false);
  assert.equal(isOwnHost("log.mineshire.com", ["log.mineshire.com"]), true);
  assert.equal(isOwnHost("notminelog.org", []), false);
});

test("log urls on a custom domain are short", () => {
  assert.equal(domainUrl("log.mineshire.com", "Ab3dEfGh2"), "https://log.mineshire.com/Ab3dEfGh2");
});
