import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { spanAt, spansOf } from "../../src/lib/diagnose/entries";
import { readInsights } from "../../src/lib/diagnose/insights";
import { analyze, countLines, detectKind, splitLines } from "../../src/lib/log";

const fixture = (name: string) =>
  readFileSync(new URL(`../fixtures/${name}`, import.meta.url), "utf8");

test("a Paper server log is named after its software, version and type", () => {
  const text = fixture("synthetic-paper-server-1.20.1.log");
  const insights = readInsights(text, detectKind(text));
  assert.deepEqual(insights.software, { id: "paper", name: "Paper" });
  assert.deepEqual(insights.type, { id: "server", name: "Server Log" });
  assert.equal(insights.version, "1.20.1");
  assert.equal(insights.title, "Paper 1.20.1 Server Log");
});

test("information lists the setup with a line each", () => {
  const text = fixture("synthetic-paper-server-1.20.1.log");
  const { information } = readInsights(text, "server");
  const byLabel = Object.fromEntries(information.map((i) => [i.label, i]));
  assert.equal(byLabel["Minecraft version"].value, "1.20.1");
  assert.equal(byLabel["Server software"].value, "Paper build 196");
  assert.equal(byLabel["Plugins"].value, "2");
  assert.equal(byLabel["Minecraft version"].line, 1);
});

test("a mod loader is labelled as a loader, server software as software", () => {
  const fabric = readInsights(fixture("real-fabric-client-integrated-1.21.11.log"), "client");
  const labels = fabric.information.map((i) => i.label);
  assert.ok(labels.includes("Mod loader"));
  assert.ok(labels.includes("Launcher"));
  assert.ok(labels.includes("Bundled mods"));
  assert.equal(fabric.title, "Fabric 1.21.11 Client Log");
});

test("a plain log with no loader is Vanilla", () => {
  const text = "[12:00:00] [Server thread/INFO]: Starting minecraft server version 1.20.1";
  const insights = readInsights(text, "server");
  assert.equal(insights.title, "Vanilla 1.20.1 Server Log");
  assert.equal(insights.information.length, 1);
});

test("a crash report is a crash report, and a Java crash log carries the Java version", () => {
  const crash = readInsights(fixture("synthetic-fabric-crash-1.20.1.txt"), "crash");
  assert.equal(crash.title, "Fabric 1.20.1 Crash Report");

  const jvm = readInsights(fixture("synthetic-jvm-crash.txt"), "jvm");
  assert.equal(jvm.title, "Java 17.0.9 Crash Report");
  assert.equal(jvm.software.id, "java");
});

test("files that aren't game logs are named like the site names them, with nothing read", () => {
  const props = readInsights("motd=Hello\nmax-players=20\n", "props");
  assert.equal(props.title, "Properties file");
  assert.equal(props.software.id, "unknown");
  assert.equal(props.version, null);
  assert.deepEqual(props.information, []);
  assert.deepEqual(props.problems, []);

  assert.equal(readInsights("just some notes", "unknown").title, "Custom");
});

test("levels use the syslog scale, and every line is in exactly one entry", () => {
  const text = [
    "loose line before any header",
    "[12:00:00] [Server thread/INFO]: info",
    "[12:00:01] [Server thread/FATAL]: fatal",
    "[12:00:02] [Server thread/WARN]: warn",
    "[12:00:03] [Server thread/DEBUG]: debug",
    "[12:00:04] [Server thread/TRACE]: trace",
    "[12:00:05] [Server thread/ERROR]: error",
    "java.lang.Exception: boom",
    "\tat a.b.C.d(C.java:1)",
    "[12:00:06 INFO]: paper style",
  ].join("\n");

  const entries = readInsights(text, "server").entries();
  assert.deepEqual(
    entries.map((e) => e.level),
    [6, 6, 2, 4, 7, 7, 3, 6],
  );
  assert.equal(entries[0].prefix, null);
  assert.equal(entries[1].prefix, "[12:00:00] [Server thread/INFO]:");
  assert.equal(entries[7].prefix, "[12:00:06 INFO]:");
  assert.ok(entries.every((e) => e.time === null));

  assert.deepEqual(
    entries[6].lines.map((l) => l.number),
    [7, 8, 9],
  );
  const numbers = entries.flatMap((e) => e.lines.map((l) => l.number));
  assert.deepEqual(numbers, Array.from({ length: 10 }, (_, i) => i + 1));
});

test("Forge and Fabric header styles keep their whole prefix", () => {
  const text = [
    "[08Aug2026 12:00:00.123] [main/INFO] [net.minecraftforge.fml.loading.FMLLoader/]: hello",
    "[12:00:00] [main/INFO] (FabricLoader) hello",
  ].join("\n");
  const [forge, fabric] = readInsights(text, "server").entries();
  assert.equal(forge.prefix, "[08Aug2026 12:00:00.123] [main/INFO] [net.minecraftforge.fml.loading.FMLLoader/]:");
  assert.equal(fabric.prefix, "[12:00:00] [main/INFO] (FabricLoader)");
});

test("text with no headers is cut where something starts, and the description is an error", () => {
  const text = fixture("synthetic-fabric-crash-1.20.1.txt");
  const insights = readInsights(text, "crash");
  const entries = insights.entries();
  const description = entries.find((e) => e.lines[0].content.startsWith("Description:"));
  assert.equal(description?.level, 3);
  assert.equal(entries[0].level, 6);
  const numbers = entries.flatMap((e) => e.lines.map((l) => l.number));
  assert.deepEqual(numbers, Array.from({ length: splitLines(text).length }, (_, i) => i + 1));
});

test("entryAt cuts a long entry and reads the line it is asked for", () => {
  const stack = Array.from({ length: 100 }, (_, i) => `\tat a.b.C.d${i}(C.java:${i})`);
  const text = ["[12:00:00] [Server thread/ERROR]: boom", ...stack, "[12:00:01] [Server thread/INFO]: after"].join("\n");
  const insights = readInsights(text, "server");
  assert.equal(insights.entryAt(50).lines.length, 40);
  assert.equal(insights.entryAt(50).lines[0].number, 1);
  assert.equal(insights.entryAt(50, 5).lines.length, 5);
  assert.equal(insights.entryAt(102).lines[0].content, "[12:00:01] [Server thread/INFO]: after");
});

test("spanAt finds the entry of any line", () => {
  const lines = ["a", "[12:00:00 INFO]: b", "c", "[12:00:01 INFO]: d"];
  const spans = spansOf(lines, "server");
  assert.deepEqual(spans.map((s) => [s.from, s.to]), [[1, 1], [2, 3], [4, 4]]);
  assert.equal(spanAt(spans, 3).from, 2);
  assert.equal(spanAt(spans, 1).from, 1);
  assert.equal(spanAt(spans, 4).from, 4);
});

test("a final line break is not another line", () => {
  assert.deepEqual(splitLines("a\nb\n"), ["a", "b"]);
  assert.deepEqual(splitLines("a\r\nb"), ["a", "b"]);
  assert.deepEqual(splitLines(""), [""]);
});

test("counting lines agrees with splitting them", () => {
  for (const text of ["", "a", "a\n", "a\nb", "a\r\nb\r\n", "\n", "\n\n", "\n\nx", "x\n\n"]) {
    assert.equal(countLines(text), splitLines(text).length, JSON.stringify(text));
  }
});

test("a text with too many lines is refused without being read", () => {
  const text = "[12:00:00] [main/ERROR]: boom\n".repeat(40_000);
  const started = performance.now();
  const analysis = analyze(text, true);
  assert.equal(analysis.lineCount, 40_000);
  assert.equal(analysis.errorCount, 0);
  assert.equal(analysis.blocked, false);
  assert.ok(performance.now() - started < 500);

  const ok = analyze("[12:00:00] [main/ERROR]: boom\n".repeat(30_000), true);
  assert.equal(ok.lineCount, 30_000);
  assert.equal(ok.errorCount, 30_000);
});

test("a big log is read quickly", () => {
  const lines: string[] = ["[12:00:00] [Server thread/INFO]: Starting minecraft server version 1.20.1"];
  for (let i = 0; i < 29_000; i += 1) {
    lines.push(`[12:00:${String(i % 60).padStart(2, "0")}] [Server thread/INFO]: Player${i} moved too quickly!`);
  }
  for (let i = 0; i < 400; i += 1) {
    lines.push("[12:01:00] [Server thread/ERROR]: Something failed");
    for (let s = 0; s < 40; s += 1) lines.push(`\tat net.minecraft.Foo.bar${s}(Foo.java:${s})`);
  }
  const text = lines.join("\n");

  const started = performance.now();
  const insights = readInsights(text, "server");
  insights.entries();
  const took = performance.now() - started;
  assert.equal(insights.version, "1.20.1");
  assert.ok(took < 3000, `took ${took.toFixed(0)} ms`);
});

