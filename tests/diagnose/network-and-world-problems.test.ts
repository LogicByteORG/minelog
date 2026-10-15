import assert from "node:assert/strict";
import { test } from "node:test";
import { readInsights } from "../../src/lib/diagnose/insights";
import type { LogKind } from "../../src/lib/log";

const problems = (text: string, kind: LogKind = "server") => readInsights(text, kind).problems;
const ids = (text: string, kind: LogKind = "server") => problems(text, kind).map((p) => p.id);
const only = (text: string, id: string, kind: LogKind = "server") => {
  const found = problems(text, kind).filter((p) => p.id === id);
  assert.ok(found.length > 0, `expected ${id}, got ${ids(text, kind).join(", ") || "nothing"}`);
  return found;
};

const at = (thread: string, level: string, ...messages: string[]) =>
  messages.map((m, i) => `[12:00:${String(i).padStart(2, "0")}] [${thread}/${level}]: ${m}`).join("\n");

const server = (level: string, ...messages: string[]) => at("Server thread", level, ...messages);

test("the vanilla watchdog names how long the tick took", () => {
  const text = [
    at("Server Watchdog", "FATAL", "A single server tick took 60.00 seconds (should be max 0.05)"),
    at("Server Watchdog", "FATAL", "Considering it to be crashed, server will forcibly shutdown."),
  ].join("\n");
  const found = only(text, "server-watchdog");
  assert.equal(found.length, 1);
  assert.equal(found[0].count, 2);
  assert.match(found[0].message, /took 60\.00 seconds/);
  assert.match(found[0].message, /should take 0\.05/);
  assert.ok(found[0].solutions.some((s) => s.includes("timeout-time")));
});

test("the Paper watchdog banner is the same problem without a number", () => {
  const text = at(
    "Paper Watchdog Thread",
    "ERROR",
    "The server has stopped responding! This is (probably) not a Paper bug.",
  );
  const [p] = only(text, "server-watchdog");
  assert.match(p.message, /main thread got stuck/);
  assert.doesNotMatch(p.message, /seconds/);
});

test("the lag warning that is not a crash stays quiet", () => {
  const text = at(
    "Paper Watchdog Thread",
    "ERROR",
    "--- DO NOT REPORT THIS TO PAPER - THIS IS NOT A BUG OR A CRASH ---",
    "The server has not responded for 10 seconds! Creating thread dump",
  );
  assert.ok(!ids(text).includes("server-watchdog"));
});

test("an async call names what the plugin tried to do, once", () => {
  const text = [
    server("ERROR", "Thread Craft Scheduler Thread - 3 failed main thread check: entity add"),
    "java.lang.IllegalStateException: Asynchronous entity add!",
    "\tat org.spigotmc.AsyncCatcher.catchOp(AsyncCatcher.java:15) ~[paper.jar:?]",
    "\tat com.example.spawner.SpawnTask.run(SpawnTask.java:44) ~[Spawner.jar:?]",
  ].join("\n");
  const found = only(text, "async-api-call");
  assert.equal(found.length, 1);
  assert.equal(found[0].count, 2);
  assert.match(found[0].message, /"entity add"/);
});

test("version mismatch reads the three wordings and says which side to change", () => {
  const older = only(server("INFO", "Disconnecting Steve: Outdated client! Please use 1.21.4"), "version-mismatch");
  assert.match(older[0].message, /older than the server's, which is 1\.21\.4/);
  assert.ok(older[0].solutions[0].includes("1.21.4"));

  const newer = only(server("INFO", "Disconnecting Alex: Outdated server! I'm still on 1.20.1"), "version-mismatch");
  assert.match(newer[0].message, /newer than the server's, which is still on 1\.20\.1/);

  const both = only(server("INFO", "Disconnecting Bob: Incompatible client! Please use 1.21.11"), "version-mismatch");
  assert.match(both[0].message, /doesn't match the server, which wants 1\.21\.11/);
  assert.ok(both[0].solutions.some((s) => s.includes("ViaVersion")));
});

test("the whitelist line explains whitelist add and the online-mode catch", () => {
  const [p] = only(server("INFO", "Disconnecting Steve: You are not white-listed on this server!"), "not-whitelisted");
  assert.ok(p.solutions[0].includes("/whitelist add"));
  assert.ok(p.solutions.some((s) => s.includes("online-mode")));
  only(server("INFO", "Disconnecting Steve: You are not whitelisted on this server!"), "not-whitelisted");
});

test("session lock covers the old wording, the new wording and a permission error", () => {
  const old = only(server("ERROR", "Failed to check session lock, aborting"), "session-lock");
  assert.match(old[0].message, /Another program has this world open/);

  const modern = only(
    server(
      "ERROR",
      "net.minecraft.util.DirectoryLock$LockException: /srv/mc/world/session.lock: already locked (possibly by other Minecraft instance?)",
    ),
    "session-lock",
  );
  assert.equal(modern[0].count, 1);

  const denied = only(
    server("ERROR", "java.nio.file.AccessDeniedException: ./world/session.lock"),
    "session-lock",
  );
  assert.match(denied[0].message, /isn't allowed to use/);
});

test("proxy forwarding tells the three disconnects apart", () => {
  const secret = only(server("INFO", "Disconnecting Steve: Unable to verify player details"), "proxy-forwarding");
  assert.ok(secret[0].solutions[0].includes("forwarding.secret"));

  const direct = only(
    server(
      "INFO",
      "Disconnecting Steve: If you wish to use IP forwarding, please enable it in your BungeeCord config as well!",
    ),
    "proxy-forwarding",
  );
  assert.match(direct[0].message, /reached the server directly/);

  const velocity = only(
    server("INFO", "Disconnecting Steve: This server requires you to connect with Velocity"),
    "proxy-forwarding",
  );
  assert.match(velocity[0].message, /only accepts players coming through Velocity/);
});

test("a throttled player is told to wait, and the admin is told about proxies", () => {
  const [p] = only(
    server("INFO", "Disconnecting Steve: Connection throttled! Please wait before reconnecting."),
    "connection-throttled",
  );
  assert.ok(p.solutions.some((s) => s.includes("connection-throttle")));
});

test("a plugin event error names the plugin and the event, one entry per plugin", () => {
  const lines = [
    server("ERROR", "Could not pass event PlayerJoinEvent to ChatManager v3.5.0"),
    "org.bukkit.event.EventException: null",
    "\tat org.bukkit.plugin.java.JavaPluginLoader$1.execute(JavaPluginLoader.java:306) ~[paper.jar:?]",
    "Caused by: java.lang.NullPointerException: Cannot invoke \"Object.toString()\"",
    server("ERROR", "Could not pass event PlayerQuitEvent to ChatManager v3.5.0"),
    server("ERROR", "Could not pass event PlayerJoinEvent to Hibba v0.1"),
  ].join("\n");
  const found = only(lines, "plugin-event-error");
  assert.equal(found.length, 2);
  const chat = found.find((p) => p.message.startsWith("ChatManager"));
  assert.ok(chat);
  assert.equal(chat.count, 2);
  assert.match(chat.message, /v3\.5\.0 hit an error while handling PlayerJoinEvent/);
});

test("mod set mismatch reads Fabric and Forge wording", () => {
  only(at("Render thread", "INFO", "Disconnected: Incompatible mod set!"), "mod-set-mismatch", "client");
  only(at("Render thread", "ERROR", "Connection closed - mismatched mod channel list"), "mod-set-mismatch", "client");
  only(at("Render thread", "ERROR", "Incompatible FML modded server"), "mod-set-mismatch", "client");
});

test("packet errors keep three different causes apart", () => {
  const larger = only(
    server(
      "ERROR",
      "io.netty.handler.codec.DecoderException: Packet play/clientbound/minecraft:set_entity_data (net.minecraft.network.protocol.game.ClientboundSetEntityDataPacket) was larger than I expected, found 14 bytes extra whilst reading packet 78",
    ),
    "packet-decode-error",
  );
  assert.ok(larger[0].solutions.some((s) => s.includes("ViaVersion")));

  const compressed = only(
    server("WARN", "Failed to send packet: io.netty.handler.codec.EncoderException: Badly compressed packet - size of 9000000 is larger than protocol maximum of 8388608"),
    "packet-decode-error",
  );
  assert.match(compressed[0].message, /too big to send/);

  const payload = only(
    at("Netty Client IO #1", "ERROR", "Payload may not be larger than 1048576 bytes"),
    "packet-decode-error",
    "client",
  );
  assert.match(payload[0].message, /custom data/);
});

test("a client login failure says which of four things happened", () => {
  const session = only(
    at("Render thread", "INFO", "Failed to log in: Invalid session (try restarting your game and the launcher)"),
    "client-login-failed",
    "client",
  );
  assert.ok(session[0].solutions[0].includes("launcher"));

  const old = only(
    at("Render thread", "INFO", "Disconnected: Invalid session (Try restarting your game)"),
    "client-login-failed",
    "client",
  );
  assert.equal(old[0].count, 1);

  const keys = [
    "The authentication servers are currently not reachable. Please try again.",
    "Multiplayer is disabled. Please check your Microsoft account settings.",
    "You are banned from playing online",
  ];
  for (const message of keys) {
    only(at("Render thread", "INFO", message), "client-login-failed", "client");
  }
});

test("a profile key problem points at the clock first", () => {
  const [p] = only(
    server("INFO", "Disconnecting Steve: Expired profile public key. Check that your system time is synchronized, and try restarting your game."),
    "profile-key-error",
  );
  assert.ok(p.solutions.some((s) => s.includes("date and time")));
  assert.ok(p.solutions.some((s) => s.includes("enforce-secure-profile")));

  const chat = only(
    server("INFO", "Disconnecting Steve: Out-of-order chat packet received. Did your system time change?"),
    "profile-key-error",
  );
  assert.match(chat[0].message, /couldn't validate/);
});

test("flying kicks point at allow-flight", () => {
  const [p] = only(server("INFO", "Disconnecting Steve: Flying is not enabled on this server"), "flying-kick");
  assert.ok(p.solutions[0].includes("allow-flight=true"));
});

test("an unknown host shows the name on a client and a different story on a server", () => {
  const client = only(
    at("Render thread", "ERROR", "Couldn't connect to server\njava.net.UnknownHostException: play.example.net"),
    "unknown-host",
    "client",
  );
  assert.match(client[0].message, /couldn't find play\.example\.net/);

  const host = only(
    server("ERROR", "java.net.UnknownHostException: sessionserver.mojang.com"),
    "unknown-host",
  );
  assert.match(host[0].message, /couldn't look up sessionserver\.mojang\.com/);
});

test("a full disk is named on Linux and on Windows", () => {
  only(server("ERROR", "java.io.IOException: No space left on device"), "disk-full");
  only(server("ERROR", "java.io.IOException: There is not enough space on the disk"), "disk-full");
});

test("too many open files needs the Java exception, not just the words", () => {
  only(server("ERROR", "java.io.IOException: Too many open files"), "too-many-open-files");
  only(server("ERROR", "java.net.SocketException: Too many open files"), "too-many-open-files");
  assert.ok(!ids(server("INFO", "Players with too many open files in their inventory are rare")).includes("too-many-open-files"));
});

test("certificate trouble is named once even across the wrapped lines", () => {
  const text = [
    at("main", "ERROR", "Failed to download file: javax.net.ssl.SSLHandshakeException: PKIX path building failed: sun.security.provider.certpath.SunCertPathBuilderException: unable to find valid certification path to requested target"),
  ].join("\n");
  const found = only(text, "ssl-certificate");
  assert.equal(found.length, 1);
});

test("a broken level.dat gets the level.dat_old advice, once", () => {
  const text = [
    server("ERROR", "Exception reading .\\world\\level.dat"),
    "java.util.zip.ZipException: Not in GZIP format",
    "\tat java.util.zip.GZIPInputStream.readHeader(GZIPInputStream.java:165) ~[?:?]",
  ].join("\n");
  const found = only(text, "world-data-corrupt");
  assert.equal(found.length, 1);
  assert.equal(found[0].count, 2);
  assert.ok(found[0].solutions.some((s) => s.includes("level.dat_old")));
});

test("a ZLIB error in chunk data is the damaged-file story, a random one is not", () => {
  const chunk = [
    server("ERROR", "Failed to read chunk [12, -4]"),
    "java.io.EOFException: Unexpected end of ZLIB input stream",
  ].join("\n");
  const [p] = only(chunk, "world-data-corrupt");
  assert.match(p.message, /damaged or was cut off/);

  const download = [
    at("main", "ERROR", "Update check failed"),
    "java.io.EOFException: Unexpected end of ZLIB input stream",
  ].join("\n");
  assert.ok(!ids(download).includes("world-data-corrupt"));
});

test("ticking crashes name the entity, the block or the world", () => {
  const report = (description: string) =>
    [
      "---- Minecraft Crash Report ----",
      "",
      "Time: 2026-10-15 12:00:00",
      `Description: ${description}`,
      "",
      "java.lang.NullPointerException: Ticking entity",
    ].join("\n");

  const entity = only(report("Ticking entity"), "ticking-crash", "crash");
  assert.match(entity[0].solutions[0], /Entity being ticked/);

  const block = only(report("Ticking block entity"), "ticking-crash", "crash");
  assert.match(block[0].solutions[0], /Block entity being ticked/);

  const world = only(report("Exception ticking world"), "ticking-crash", "crash");
  assert.match(world[0].message, /updating the world/);
});

test("the other crash descriptions still get a summary, not a ticking problem", () => {
  const text = [
    "---- Minecraft Crash Report ----",
    "",
    "Description: Exception in server tick loop",
    "",
    "java.lang.IllegalStateException: Failed to initialize",
  ].join("\n");
  assert.deepEqual(ids(text, "crash"), ["crash-summary"]);
});
