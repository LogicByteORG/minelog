import assert from "node:assert/strict";
import http from "node:http";
import test from "node:test";
import { hashKey, generateKey, keyFromRequest, looksLikeKey, autoServerName } from "../src/lib/api-keys";
import { parseEventInput } from "../src/lib/event-input";
import { isPublicAddress, postJson } from "../src/lib/safe-post";
import { open, seal } from "../src/lib/vault";
import { buildPayload, prepareRequest, type OutgoingEvent } from "../src/lib/webhook-format";
import { detectWebhook } from "../src/lib/webhook-url";

process.env.BETTER_AUTH_SECRET = "test-secret-test-secret-test-secret-123";

const DISCORD = "https://discord.com/api/webhooks/123456789012345678/abc_DEF-ghi";
const SLACK = "https://hooks.slack.com/services/T000/B000/XXXXXXXX";

const event: OutgoingEvent = {
  event: "tps",
  level: "warning",
  title: "TPS dropped",
  message: "Running at <12> & falling",
  fields: [{ name: "TPS", value: "12.4" }],
  occurredAt: new Date("2026-10-20T12:00:00Z"),
  serverName: "Paper 1.21.1",
};

test("stored webhook URLs are locked and open again", () => {
  const sealed = seal(DISCORD);
  assert.ok(!sealed.includes("discord.com"));
  assert.equal(open(sealed), DISCORD);
  assert.notEqual(seal(DISCORD), sealed);
  assert.throws(() => open(sealed.replace(/.$/, "A")));
});

test("the URL tells us which service it belongs to", () => {
  const discord = detectWebhook(DISCORD);
  assert.ok(discord.ok && discord.kind === "discord");
  assert.ok(discord.ok && !discord.hint.includes("abc_DEF"));
  const slack = detectWebhook(SLACK);
  assert.ok(slack.ok && slack.kind === "slack");
  assert.equal(detectWebhook("https://example.com/hooks/secret-token?x=1").ok, false);
});

test("URLs that could reach our own network are refused", () => {
  for (const url of [
    "http://example.com/hook",
    "https://127.0.0.1/hook",
    "https://169.254.169.254/latest/meta-data",
    "https://localhost/hook",
    "https://[::1]/hook",
    "https://intranet/hook",
    "https://router.local/hook",
    "https://user:pass@example.com/hook",
    "not a url",
    "",
  ]) {
    assert.equal(detectWebhook(url).ok, false, url);
  }
});

test("a Discord or Slack link that is not a webhook gets a helpful refusal", () => {
  const discord = detectWebhook("https://discord.com/channels/1/2");
  assert.ok(!discord.ok && discord.error.includes("webhook"));
  const slack = detectWebhook("https://hooks.slack.com/nope");
  assert.ok(!slack.ok && slack.error.includes("Slack"));
});

test("private and special addresses are never public", () => {
  for (const address of ["127.0.0.1", "10.1.2.3", "172.16.0.1", "192.168.1.1", "169.254.169.254", "100.64.0.1", "0.0.0.0", "::1", "fe80::1", "fc00::1", "::ffff:127.0.0.1"]) {
    assert.equal(isPublicAddress(address), false, address);
  }
  for (const address of ["8.8.8.8", "1.1.1.1", "93.184.216.34", "2606:4700:4700::1111"]) {
    assert.equal(isPublicAddress(address), true, address);
  }
  assert.equal(isPublicAddress("not an ip"), false);
});

test("posting to our own network is blocked, even by name", async () => {
  const result = await postJson("https://localhost/hook", { a: 1 });
  assert.equal(result.ok, false);
  const plain = await postJson("http://example.com/hook", { a: 1 });
  assert.deepEqual(plain, { ok: false, error: "Only https URLs are allowed" });
});

test("a JSON post arrives with the body and headers we expect", async () => {
  const received: { body: string; type: string | undefined; event: string | undefined }[] = [];
  const server = http.createServer((request, response) => {
    let body = "";
    request.on("data", (chunk) => (body += chunk));
    request.on("end", () => {
      received.push({
        body,
        type: request.headers["content-type"],
        event: request.headers["x-minelog-event"] as string | undefined,
      });
      response.statusCode = 204;
      response.end();
    });
  });
  await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
  const { port } = server.address() as { port: number };
  try {
    const result = await postJson(
      `http://127.0.0.1:${port}/hook`,
      { hello: "world" },
      { guard: false, headers: { "x-minelog-event": "tps" } },
    );
    assert.deepEqual(result, { ok: true, status: 204 });
    assert.equal(received[0].body, '{"hello":"world"}');
    assert.equal(received[0].type, "application/json");
    assert.equal(received[0].event, "tps");
  } finally {
    server.close();
  }
});

test("each service gets a message in its own shape", () => {
  const discord = buildPayload("discord", event) as { embeds: { title: string; color: number; fields: unknown[]; footer: { text: string } }[] };
  assert.equal(discord.embeds[0].title, "TPS dropped");
  assert.equal(discord.embeds[0].color, 0xf5a524);
  assert.equal(discord.embeds[0].fields.length, 1);
  assert.ok(discord.embeds[0].footer.text.includes("Paper 1.21.1"));

  const slack = buildPayload("slack", event) as { attachments: { text: string; color: string }[] };
  assert.equal(slack.attachments[0].text, "Running at &lt;12&gt; &amp; falling");
  assert.equal(slack.attachments[0].color, "#f5a524");

});

test("an event from the plugin is cleaned and given sensible defaults", () => {
  const parsed = parseEventInput({ event: "tps", fields: { TPS: 12.4, Players: 20 } }, "Paper 1.21.1");
  assert.ok(parsed.ok);
  if (parsed.ok) {
    assert.equal(parsed.event.title, "TPS dropped");
    assert.equal(parsed.event.level, "warning");
    assert.deepEqual(parsed.event.fields, [
      { name: "TPS", value: "12.4" },
      { name: "Players", value: "20" },
    ]);
  }

  const custom = parseEventInput({ event: "custom", title: "Hi", message: "x".repeat(5000), level: "error" }, "S");
  assert.ok(custom.ok && custom.event.message.length === 1500 && custom.event.level === "error");
});

test("a bad event is refused with a reason", () => {
  assert.ok(!parseEventInput(null, "S").ok);
  assert.ok(!parseEventInput([], "S").ok);
  assert.ok(!parseEventInput({ event: "nope" }, "S").ok);
  assert.ok(!parseEventInput({ event: "tps", title: 5 }, "S").ok);
  assert.ok(!parseEventInput({ event: "tps", level: "loud" }, "S").ok);
  assert.ok(!parseEventInput({ event: "tps", fields: [{ name: "", value: "x" }] }, "S").ok);
});

test("API keys look right and only their hash is ever kept", () => {
  const { key, hash, prefix } = generateKey();
  assert.ok(looksLikeKey(key));
  assert.equal(hash, hashKey(key));
  assert.equal(hash.length, 64);
  assert.ok(key.startsWith(prefix));
  assert.notEqual(generateKey().key, key);

  const request = new Request("http://x", { headers: { authorization: `Bearer ${key}` } });
  assert.equal(keyFromRequest(request), key);
  assert.equal(keyFromRequest(new Request("http://x", { headers: { authorization: "Bearer nope" } })), null);
  assert.equal(keyFromRequest(new Request("http://x")), null);
});

test("the server name comes from what the plugin reports", () => {
  assert.equal(autoServerName({ software: "Paper", version: "1.21.1", pluginVersion: null }), "Paper 1.21.1");
  assert.equal(autoServerName({ software: "Velocity", version: null, pluginVersion: null }), "Velocity");
  assert.equal(autoServerName({ software: null, version: null, pluginVersion: null }), "Minecraft server");
});

test("every supported platform is recognised from its URL", () => {
  const cases: [string, string][] = [
    ["https://prod-12.westus.logic.azure.com:443/workflows/abc/triggers/manual/paths/invoke?sig=x", "teams"],
    ["https://chat.googleapis.com/v1/spaces/AAAA/messages?key=k&token=t", "googlechat"],
    ["https://api.telegram.org/bot123456:ABC-def/sendMessage?chat_id=-100123", "telegram"],
    ["https://media.guilded.gg/webhooks/0e5c6c54-1f9d-4a4e-8b0b-0123456789ab/abcDEF123", "guilded"],
    ["https://chat.example.com/hooks/abcdefghij0123456789abcdef", "mattermost"],
  ];
  for (const [url, kind] of cases) {
    const found = detectWebhook(url);
    assert.ok(found.ok && found.kind === kind, `${kind}: ${JSON.stringify(found)}`);
  }
  assert.equal(detectWebhook("https://example.com/hooks/not-a-mattermost-id").ok, false);
});

test("half-finished platform URLs say what is missing", () => {
  const noChat = detectWebhook("https://api.telegram.org/bot123456:ABC-def/sendMessage");
  assert.ok(!noChat.ok && noChat.error.includes("chat_id"));
  const noToken = detectWebhook("https://chat.googleapis.com/v1/spaces/AAAA/messages");
  assert.ok(!noToken.ok && noToken.error.includes("Google Chat"));
  const notHook = detectWebhook("https://media.guilded.gg/some/page");
  assert.ok(!notHook.ok);
});

test("each platform gets a payload it understands", () => {
  const teams = buildPayload("teams", event) as { type: string; attachments: { contentType: string }[] };
  assert.equal(teams.type, "message");
  assert.equal(teams.attachments[0].contentType, "application/vnd.microsoft.card.adaptive");

  const chat = buildPayload("googlechat", event) as { text: string };
  assert.ok(chat.text.startsWith("*TPS dropped*"));
  assert.ok(chat.text.includes("*TPS:* 12.4"));

  const telegram = buildPayload("telegram", event) as { text: string; parse_mode: string };
  assert.equal(telegram.parse_mode, "HTML");
  assert.ok(telegram.text.includes("&lt;12&gt; &amp; falling"));
  assert.ok(!telegram.text.includes("<12>"));

  const guilded = buildPayload("guilded", event) as { embeds: { title: string }[] };
  assert.equal(guilded.embeds[0].title, "TPS dropped");

  const mattermost = buildPayload("mattermost", event) as { attachments: { title: string; fields: unknown[] }[] };
  assert.equal(mattermost.attachments[0].title, "TPS dropped");
  assert.equal(mattermost.attachments[0].fields.length, 1);
});

test("Telegram gets its chat in the body and not in the address", () => {
  const url = "https://api.telegram.org/bot123456:ABC-def/sendMessage?chat_id=-100123";
  const request = prepareRequest("telegram", url, { text: "hi" });
  assert.equal(request.url, "https://api.telegram.org/bot123456:ABC-def/sendMessage");
  assert.deepEqual(request.payload, { text: "hi", chat_id: "-100123" });
  assert.deepEqual(prepareRequest("discord", DISCORD, { a: 1 }), { url: DISCORD, payload: { a: 1 } });
});
