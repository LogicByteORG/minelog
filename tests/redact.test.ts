import assert from "node:assert/strict";
import { test } from "node:test";
import { redact } from "../src/lib/redact";

const hidden = (text: string) => redact(text).text;

// Built from pieces so that no complete webhook address sits in the source,
// which keeps secret scanners from mistaking this made up value for a real one.
const SLACK_HOOK = ["https://hooks.slack", ".com/services/", "TFAKE0001", "/", "BFAKE0001", "/"].join("");

test("launch arguments and JSON style secrets are hidden, whatever the key is called", () => {
  assert.equal(hidden("--username Steve --accessToken ey123abc"), "--username Steve --accessToken [redacted]");
  assert.equal(hidden('"access_token": "abc123secretvalue"'), '"access_token": "[redacted]"');
  assert.equal(hidden("accessToken=abc123secretvalue"), "accessToken=[redacted]");
  assert.equal(hidden("authToken: abc123secretvalue"), "authToken: [redacted]");
  assert.equal(hidden("refresh_token=abc123secretvalue"), "refresh_token=[redacted]");
  assert.equal(hidden('"password":"hunter2"'), '"password":"[redacted]"');
  assert.equal(hidden("rcon.password=mypass"), "rcon.password=[redacted]");
  assert.equal(hidden("password = hunter2"), "password = [redacted]");
});

test("Authorization headers keep the scheme and lose the credential", () => {
  assert.equal(hidden("Authorization: Bearer abc123secretvalue456"), "Authorization: Bearer [redacted]");
  assert.equal(hidden("Authorization: Basic dXNlcjpwYXNzd29yZA=="), "Authorization: Basic [redacted]");
});

test("webhook addresses lose their token but keep the host", () => {
  assert.equal(
    hidden("https://discord.com/api/webhooks/123456789012345678/AbCdEfGhIjKlMnOpQrStUvWxYz0123456789_-abcd"),
    "https://discord.com/api/webhooks/123456789012345678/[redacted]",
  );
  assert.equal(
    hidden(`${SLACK_HOOK}${"abcdefghijklmnopqrstuvwx"}`),
    `${SLACK_HOOK}[redacted]`,
  );
});

test("a password inside an address is hidden, the host is not", () => {
  assert.equal(
    hidden("mysql://admin:p4ssw0rd@db.example.com:3306/mc"),
    "mysql://admin:[redacted]@db.example.com:3306/mc",
  );
  assert.equal(
    hidden("jdbc:mysql://localhost/mc?user=root&password=secret123"),
    "jdbc:mysql://localhost/mc?user=root&password=[redacted]",
  );
});

test("IPv6 addresses are hidden like IPv4 ones, with or without a port", () => {
  assert.equal(hidden("Connected to /[2001:db8:85a3::8a2e:370:7334]:25565"), "Connected to /[[redacted]]:25565");
  assert.equal(hidden("from 2a00:1450:4001:81b::200e ok"), "from [redacted] ok");
  assert.equal(hidden("Steve (/2001:db8::1:51234) logged in"), "Steve (/[redacted]:51234) logged in");
  assert.equal(hidden("Steve (/203.0.113.7:51234) logged in"), "Steve (/[redacted]:51234) logged in");
});

test("local addresses, timestamps and code that looks like an address are left alone", () => {
  for (const line of [
    "[12:00:00] [Server thread/INFO]: Done (3.2s)!",
    "[12:34:56] [main/INFO]: tick 12:34:56",
    "Caused by: java.lang.Foo::bar",
    "List::add and Item::new",
    "Connecting to ::1 port 25565",
    "loopback 127.0.0.1 and fe80::1",
    "ratio 1:2:3:4:5:6:7",
    "time=12:00:00:123",
    "uuid 069a79f4-44e9-4726-a5be-fca90e38aaf5",
  ]) {
    assert.equal(hidden(line), line);
  }
});

test("words that only look like secrets are not touched", () => {
  for (const line of ["tokens: 5", "tokenCount = 3", "password required", "secretary: john", "Mixin apply for mod x failed"]) {
    assert.equal(hidden(line), line);
  }
});

test("redacting twice changes nothing and counts nothing the second time", () => {
  const text = [
    "--accessToken abc",
    '"access_token": "abc123secretvalue"',
    "Authorization: Bearer abc123secretvalue456",
    "from 2a00:1450:4001:81b::200e ok",
    "mysql://admin:p4ssw0rd@db.example.com/mc",
    "Steve (/203.0.113.7:51234) logged in",
  ].join("\n");
  const once = redact(text);
  assert.ok(once.findings.length > 0);
  const twice = redact(once.text);
  assert.equal(twice.text, once.text);
  assert.deepEqual(twice.findings, []);
});
