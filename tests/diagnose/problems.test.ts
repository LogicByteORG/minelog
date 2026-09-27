import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { readInsights } from "../../src/lib/diagnose/insights";
import { requiredJava } from "../../src/lib/diagnose/java-versions";
import { MAX_PROBLEMS } from "../../src/lib/diagnose/problems";
import type { LogKind } from "../../src/lib/log";

const fixture = (name: string) =>
  readFileSync(new URL(`../fixtures/${name}`, import.meta.url), "utf8");

const problems = (text: string, kind: LogKind = "server") => readInsights(text, kind).problems;
const ids = (text: string, kind: LogKind = "server") => problems(text, kind).map((p) => p.id);

const server = (...messages: string[]) =>
  messages.map((m, i) => `[12:00:${String(i).padStart(2, "0")}] [Server thread/ERROR]: ${m}`).join("\n");

test("OutOfMemoryError points at memory, in words that fit a server or a client", () => {
  const line = server("java.lang.OutOfMemoryError: Java heap space");
  const [onServer] = problems(line, "server");
  assert.equal(onServer.id, "out-of-memory");
  assert.equal(onServer.count, 1);
  assert.match(onServer.solutions[0], /hosting panel/);

  const [onClient] = problems(line, "client");
  assert.match(onClient.solutions[0], /launcher/);
  assert.doesNotMatch(onClient.solutions[0], /hosting panel/);
});

test("GC overhead limit is the same problem, native threads are not", () => {
  assert.deepEqual(ids(server("java.lang.OutOfMemoryError: GC overhead limit exceeded")), ["out-of-memory"]);

  const [thread] = problems(server("java.lang.OutOfMemoryError: unable to create native thread: possibly out of memory"));
  assert.equal(thread.id, "native-thread");
  assert.match(thread.solutions[0], /Don't add more memory/);
});

test("a Java crash log that runs out of system memory", () => {
  const text = [
    "#",
    "# There is insufficient memory for the Java Runtime Environment to continue.",
    "# Native memory allocation (mmap) failed to map 268435456 bytes.",
  ].join("\n");
  assert.deepEqual(ids(text, "jvm"), ["system-memory"]);
});

test("UnsupportedClassVersionError says which Java is needed and which is running", () => {
  const text = [
    "[12:00:00] [main/INFO]: Starting minecraft server version 1.21.4",
    '[12:00:01] [main/ERROR]: Exception in thread "main" java.lang.UnsupportedClassVersionError: net/minecraft/server/Main has been compiled by a more recent version of the Java Runtime (class file version 65.0), this version of the Java Runtime only recognizes class file versions up to 61.0',
  ].join("\n");
  const [problem] = problems(text);
  assert.equal(problem.id, "java-version");
  assert.equal(problem.message, "Something needs Java 21, but the game is running on Java 17.");
  assert.equal(problem.line, 2);
  assert.ok(problem.solutions.includes("Run it with Java 21 or newer."));
  assert.ok(problem.solutions.includes("Minecraft 1.21.4 itself needs Java 21 or newer."));
});

test("old Java wording still gives the needed version", () => {
  const [problem] = problems(server("java.lang.UnsupportedClassVersionError: Foo : Unsupported major.minor version 52.0"));
  assert.equal(problem.id, "java-version");
  assert.match(problem.message, /needs Java 8, but the game is running on an older Java/);
});

test("the same Java mismatch across many mods is one problem", () => {
  const line = (mod: string) =>
    `java.lang.UnsupportedClassVersionError: ${mod} has been compiled by a more recent version of the Java Runtime (class file version 65.0), this version of the Java Runtime only recognizes class file versions up to 61.0`;
  const [problem, ...rest] = problems(server(line("a/A"), line("b/B"), line("c/C")));
  assert.equal(rest.length, 0);
  assert.equal(problem.count, 3);
});

test("which Java a game version needs", () => {
  const cases: [string, number | null][] = [
    ["1.12.2", 8],
    ["1.16.5", 8],
    ["1.17.1", 16],
    ["1.18", 17],
    ["1.20.4", 17],
    ["1.20.5", 21],
    ["1.21.11", 21],
    ["26.1", 25],
    ["26.2", 25],
    ["24w14a", null],
    ["unknown", null],
  ];
  for (const [version, java] of cases) assert.equal(requiredJava(version), java, version);
});

test("Can't keep up needs to repeat before it counts", () => {
  const lag = (n: number) =>
    "[12:00:00] [Server thread/WARN]: Can't keep up! Is the server overloaded? Running 2345ms or 46 ticks behind\n".repeat(n);
  assert.deepEqual(ids(lag(2)), []);
  const [problem] = problems(lag(3));
  assert.equal(problem.id, "server-overloaded");
  assert.equal(problem.count, 3);
});

test("the port banner is one problem, however many lines it takes", () => {
  const text = [
    "[12:00:00] [Server thread/ERROR]: **** FAILED TO BIND TO PORT!",
    "[12:00:00] [Server thread/WARN]: The exception was: java.net.BindException: Address already in use: bind",
    "[12:00:00] [Server thread/WARN]: Perhaps a server is already running on that port?",
  ].join("\n");
  const found = problems(text);
  assert.equal(found.length, 1);
  assert.equal(found[0].id, "port-bind");
  assert.equal(found[0].count, 1);
});

test("client code on a dedicated server, from a real NeoForge log that crashed on it", () => {
  const [problem] = problems(fixture("real-neoforge-server-1.21.1.log"));
  assert.equal(problem.id, "client-code-on-server");
  assert.equal(problem.line, 10);
  assert.match(problem.message, /net\.minecraft\.client\.RecipeBookCategories/);
});

test("a plugin that needs a newer server is named from the entry above the exception", () => {
  const text = [
    "[12:00:00 INFO]: Starting minecraft server version 1.20.1",
    "[12:00:01 ERROR]: Could not load 'plugins/Foo.jar' in folder 'plugins'",
    "org.bukkit.plugin.InvalidPluginException: Unsupported API version 1.21",
    "\tat org.bukkit.plugin.java.JavaPluginLoader.loadPlugin(JavaPluginLoader.java:100)",
  ].join("\n");
  const [problem] = problems(text);
  assert.equal(problem.id, "plugin-needs-newer-server");
  assert.equal(problem.message, "Foo needs Minecraft 1.21 or newer, and this server is older.");
  assert.equal(problem.line, 3);
  assert.ok(problem.solutions.includes("Or remove Foo.jar from the plugins folder."));
});

test("a plugin problem without a header naming the plugin stays general", () => {
  const [problem] = problems("Caused by: org.bukkit.plugin.InvalidPluginException: Unsupported API version 1.19");
  assert.equal(problem.message, "A plugin needs Minecraft 1.19 or newer, and this server is older.");
});

test("two different plugins are two problems", () => {
  const one = (name: string) =>
    `[12:00:01 ERROR]: Could not load 'plugins/${name}.jar' in folder 'plugins'\norg.bukkit.plugin.InvalidPluginException: Unsupported API version 1.21`;
  assert.equal(problems([one("A"), one("B")].join("\n")).length, 2);
});

test("a damaged jar", () => {
  assert.deepEqual(
    ids(server("java.util.zip.ZipException: zip END header not found")),
    ["damaged-file"],
  );
  assert.deepEqual(
    ids(server("Caused by: java.util.zip.ZipException: invalid distance too far back")),
    ["damaged-file"],
  );
});

test("a crash report is read too", () => {
  const text = fixture("synthetic-fabric-crash-1.20.1.txt").replace(
    "java.lang.IllegalStateException: Failed to load",
    "java.lang.OutOfMemoryError: Java heap space",
  );
  const [problem] = problems(text, "crash");
  assert.equal(problem.id, "out-of-memory");
  assert.equal(problem.line, 7);
});

test("chat cannot pose as a problem", () => {
  const chat = [
    "[12:00:00] [Server thread/INFO]: <Steve> java.lang.OutOfMemoryError: Java heap space",
    "[12:00:01] [Server thread/INFO]: [Not Secure] <Alex> **** FAILED TO BIND TO PORT!",
    "[12:00:02] [Server thread/INFO]: [Server] java.util.zip.ZipException: zip END header not found",
    "[12:00:03] [Async Chat Thread - #1/INFO]: <Bob> Caused by: org.bukkit.plugin.InvalidPluginException: Unsupported API version 1.21",
  ].join("\n");
  assert.deepEqual(ids(chat), []);
});

test("healthy real logs stay quiet", () => {
  assert.deepEqual(ids(fixture("real-forge-server-1.20.1.log")), []);
  assert.deepEqual(ids(fixture("real-fabric-1.21.11.log")), []);
  assert.deepEqual(ids(fixture("real-forge-client-1.19.2.log"), "client"), []);
  assert.deepEqual(ids(fixture("real-paper-1.21.11.log")), []);
  assert.deepEqual(ids(fixture("real-fabric-client-integrated-1.21.11.log"), "client"), []);
});

test("files that are not game logs get no problems", () => {
  const text = "note=java.lang.OutOfMemoryError: Java heap space\nother=1";
  assert.deepEqual(ids(text, "props"), []);
  assert.deepEqual(ids(text, "unknown"), []);
});

test("problems come in order of appearance, and the list is capped", () => {
  const many = Array.from(
    { length: MAX_PROBLEMS + 10 },
    (_, i) =>
      `[12:00:01 ERROR]: Could not load 'plugins/P${i}.jar' in folder 'plugins'\norg.bukkit.plugin.InvalidPluginException: Unsupported API version 1.21`,
  ).join("\n");
  const found = problems(many);
  assert.equal(found.length, MAX_PROBLEMS);
  assert.ok(found.every((p, i) => i === 0 || found[i - 1].line < p.line));
});

test("no problem has an empty message or empty advice", () => {
  const samples = [
    server("java.lang.OutOfMemoryError: Java heap space"),
    server("java.lang.OutOfMemoryError: unable to create native thread"),
    server("**** FAILED TO BIND TO PORT!"),
    server("java.util.zip.ZipException: zip END header not found"),
    server("Attempted to load class a/B for invalid dist DEDICATED_SERVER"),
  ];
  for (const sample of samples) {
    for (const problem of problems(sample)) {
      assert.ok(problem.message.length > 10);
      assert.ok(problem.solutions.length > 0 && problem.solutions.every((s) => s.length > 10));
      const all = [problem.message, ...problem.solutions].join(" ");
      assert.doesNotMatch(all, /[—–‘’“”]/);
    }
  }
});

