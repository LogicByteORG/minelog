import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { readEnvironment } from "../../src/lib/diagnose";
import { loaderText } from "../../src/lib/diagnose/present";
import { detectKind } from "../../src/lib/log";

function read(name: string) {
  const text = readFileSync(new URL(`../fixtures/${name}`, import.meta.url), "utf8");
  return { text, env: readEnvironment(text, detectKind(text)) };
}

test("NeoForge 1.21.1 server: abbreviated loggers, java line, mod loading line", () => {
  const { env } = read("real-neoforge-server-1.21.1.log");
  assert.equal(env.gameVersion?.value, "1.21.1");
  assert.equal(env.gameVersion?.confidence, "high");
  assert.equal(env.loader?.value, "neoforge");
  assert.equal(env.loader?.detail, "21.1.57");
  assert.equal(env.loader?.confidence, "high");
  assert.equal(env.java?.value, "21");
  assert.equal(env.java?.detail, "Oracle Corporation");
  assert.deepEqual(env.conflicts, []);
});

test("Forge 1.20.1 server: version comes from the launch arguments", () => {
  const { env } = read("real-forge-server-1.20.1.log");
  assert.equal(env.gameVersion?.value, "1.20.1");
  assert.equal(env.loader?.value, "forge");
  assert.equal(env.loader?.detail, "47.4.0");
  assert.equal(env.java?.value, "17.0.15");
  assert.equal(env.java?.detail, "Eclipse Adoptium");
});

test("Forge 1.19.2 client with a date in every timestamp", () => {
  const { env } = read("real-forge-client-1.19.2.log");
  assert.equal(env.gameVersion?.value, "1.19.2");
  assert.equal(env.loader?.value, "forge");
  assert.equal(env.loader?.detail, "43.3.0");
  assert.equal(env.java?.value, "17.0.8");
  assert.equal(env.java?.detail, "Microsoft");
});

test("Paper 1.21.11: new banner without (MC: ...), bootstrap lines, plugin list", () => {
  const { env } = read("real-paper-1.21.11.log");
  assert.equal(env.gameVersion?.value, "1.21.11");
  assert.equal(env.gameVersion?.confidence, "high");
  assert.equal(env.loader?.value, "paper");
  assert.equal(env.loader?.detail, "build 130");
  assert.equal(loaderText(env.loader!), "Paper build 130");
  assert.equal(env.java?.value, "25");
  assert.equal(env.java?.detail, "Oracle Corporation");
  assert.deepEqual(
    env.mods.map((m) => `${m.name} ${m.version}`).sort(),
    [
      "AdvancedEnchantments 9.22.9",
      "LuckPerms 5.5.38",
      "PlaceholderAPI 2.12.2",
      "TabTPS 1.3.30",
      "packetevents 2.11.2",
    ],
  );
});

test("Fabric 1.21.11: the list has no (FabricLoader) prefix any more", () => {
  const { env } = read("real-fabric-1.21.11.log");
  assert.equal(env.gameVersion?.value, "1.21.11");
  assert.equal(env.loader?.value, "fabric");
  assert.equal(env.loader?.detail, "0.19.2");
  assert.deepEqual(env.mods.map((m) => m.id), ["fabric-api", "fabricloader", "minecraft"]);
});

test("Forge 1.20.1 crash report: pipe table, tabs or spaces", () => {
  const { text, env } = read("real-forge-crash-1.20.1.txt");
  assert.equal(env.gameVersion?.value, "1.20.1");
  assert.equal(env.loader?.value, "forge");
  assert.equal(env.loader?.detail, "47.2.32");
  assert.equal(env.java?.value, "22.0.1");
  assert.equal(env.mods.length, 6);
  const jei = env.mods.find((m) => m.id === "jei");
  assert.equal(jei?.name, "Just Enough Items");
  assert.equal(jei?.version, "15.3.0.7");

  const spaced = readEnvironment(text.replaceAll("\t", "    "), "crash");
  assert.deepEqual(spaced.mods, env.mods.map((m) => m));
  assert.equal(spaced.loader?.value, "forge");
});

test("NeoForge crash report gives the bare version", () => {
  const text = [
    "---- Minecraft Crash Report ----",
    "",
    "-- System Details --",
    "Details:",
    "\tMinecraft Version: 1.21.1",
    "\tMinecraft Version ID: 1.21.1",
    "\tJava Version: 23, Oracle Corporation",
    "\tModLauncher launch target: forgeserver",
    "\tFML: 4.0.24",
    "\tNeoForge: 21.1.57",
  ].join("\n");
  const env = readEnvironment(text, "crash");
  assert.equal(env.loader?.value, "neoforge");
  assert.equal(env.loader?.detail, "21.1.57");
  assert.equal(env.java?.value, "23");
});

test("a 15 MB log with thousands of stack traces is read in well under a second", () => {
  const { text } = read("real-forge-server-1.20.1.log");
  const frame = "\tat net.minecraft.server.MinecraftServer.tickServer(MinecraftServer.java:1)\n";
  const noise = Array.from(
    { length: 30_000 },
    (_, i) => `[19:50:${String(i % 60).padStart(2, "0")}] [Server thread/WARN]: line ${i}\n${frame.repeat(8)}`,
  ).join("");
  const big = text + noise;
  const started = performance.now();
  const env = readEnvironment(big, detectKind(big));
  const took = performance.now() - started;
  assert.equal(env.loader?.value, "forge");
  assert.ok(took < 1000, `took ${took.toFixed(0)} ms`);
});

test("the loader named in Java's bootstrap line cannot be forged from the chat", () => {
  const { text } = read("real-paper-1.21.11.log");
  const forged = `${text}[19:20:00 INFO]: <Steve> [bootstrap] Loading Purpur 1.12.2-1-x (2020) for Minecraft 1.12.2\n`;
  const env = readEnvironment(forged, "server");
  assert.equal(env.loader?.value, "paper");
  assert.equal(env.gameVersion?.value, "1.21.11");
});

