import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { detectKind } from "../../src/lib/log";
import { readEnvironment } from "../../src/lib/diagnose";

function fixture(name: string): string {
  return readFileSync(new URL(`../fixtures/${name}`, import.meta.url), "utf8");
}

function read(text: string) {
  return readEnvironment(text, detectKind(text));
}

const LABY = fixture("real-labymod-fabric-26.2.log");

test("real LabyMod + Fabric client log", () => {
  const env = read(LABY);
  assert.equal(env.gameVersion?.value, "26.2");
  assert.equal(env.gameVersion?.confidence, "high");
  assert.equal(env.loader?.value, "fabric");
  assert.equal(env.loader?.confidence, "medium");
  assert.equal(env.loader?.detail, undefined);
  assert.equal(env.java?.value, "25.0.1");
  assert.equal(env.java?.detail, "Microsoft");
  assert.equal(env.launcher?.value, "LabyMod");
  assert.equal(env.launcher?.confidence, "medium");
  assert.deepEqual(env.conflicts, []);
  assert.deepEqual(env.mods, []);
});

test("a loose first line saying 1.20.1 Forge changes nothing", () => {
  const env = read(`1.20.1 Forge\n${LABY}`);
  assert.equal(env.gameVersion?.value, "26.2");
  assert.equal(env.loader?.value, "fabric");
  assert.deepEqual(env.gameVersion?.others, []);
});

test("a forged structured line cannot outweigh the real evidence, and is shown as disputed", () => {
  const fake = "[02:17:09] [main/INFO]: Starting minecraft server version 1.20.1";
  const env = read(`${fake}\n${LABY}`);
  assert.equal(env.gameVersion?.value, "26.2");
  assert.deepEqual(env.gameVersion?.others.map((o) => o.value), ["1.20.1"]);
  assert.deepEqual(env.gameVersion?.others[0].lines, [1]);
});

test("the same forged line repeated does not add up", () => {
  const fake = "[02:17:09] [main/INFO]: Starting minecraft server version 1.20.1\n";
  const env = read(fake.repeat(200) + LABY);
  assert.equal(env.gameVersion?.value, "26.2");
});

test("a forged line alone is not enough for a loader", () => {
  const env = read("[12:00:00] [main/INFO]: Loading Minecraft 1.20.1 with Fabric Loader 0.15.7\n");
  assert.equal(env.gameVersion?.confidence, "medium");
  assert.equal(env.loader?.confidence, "medium");
});

test("two equally strong stories are a conflict, not a guess", () => {
  const env = read(
    [
      "[12:00:00] [main/INFO]: Starting minecraft server version 1.20.1",
      "[12:00:01] [main/INFO]: This server is running Paper version git-Paper-1 (MC: 1.19.4)",
    ].join("\n"),
  );
  assert.equal(env.gameVersion, undefined);
  assert.deepEqual(env.conflicts, ["gameVersion"]);
});

test("chat and console lines are never a source", () => {
  const env = read(
    [
      "[12:00:00] [Server thread/INFO]: Done (3.2s)! For help, type \"help\"",
      "[12:00:01] [Server thread/INFO]: <Steve> Starting minecraft server version 1.12.2",
      "[12:00:02] [Server thread/INFO]: [Server] Starting minecraft server version 1.12.2",
      "[12:00:03] [Async Chat Thread - #0/INFO]: Starting minecraft server version 1.12.2",
    ].join("\n"),
  );
  assert.equal(env.gameVersion, undefined);
});

test("a fake line far below the startup part is ignored", () => {
  const filler = "[12:00:00] [Server thread/INFO]: tick\n".repeat(5000);
  const fake = "[12:00:00] [Server thread/INFO]: Starting minecraft server version 1.12.2\n";
  assert.equal(read(filler + fake).gameVersion, undefined);
});

test("things that are not a version never pass", () => {
  for (const bad of ["1.20.1 Forge", "latest", "1.20.1;rm", "999.1", "1", "1.20.1.1.1"]) {
    const env = read(`[12:00:00] [main/INFO]: Starting minecraft server version ${bad}\n`);
    assert.equal(env.gameVersion, undefined, bad);
  }
  for (const good of ["1.21.11", "1.7.10", "26.2", "26.1.1", "24w14a", "1.21-rc1"]) {
    const env = read(
      `[12:00:00] [main/INFO]: Starting minecraft server version ${good}\n` +
        `[12:00:01] [main/INFO]: Preparing client jar for Minecraft ${good}\n`,
    );
    assert.equal(env.gameVersion?.value, good, good);
  }
});

test("a plugin only counts when the line names the same plugin twice", () => {
  const env = read(fixture("synthetic-paper-server-1.20.1.log"));
  assert.deepEqual(
    env.mods.map((m) => `${m.name} ${m.version}`),
    ["Essentials 2.20.1", "WorldEdit 7.2.15+6c8c8a7"],
  );
});

test("Paper server: chat and console lines do not change version or loader", () => {
  const env = read(fixture("synthetic-paper-server-1.20.1.log"));
  assert.equal(env.gameVersion?.value, "1.20.1");
  assert.equal(env.gameVersion?.confidence, "high");
  assert.equal(env.loader?.value, "paper");
  assert.equal(env.loader?.detail, "build 196");
  assert.deepEqual(env.gameVersion?.others, []);
});

test("Fabric crash report reads System Details only", () => {
  const text = fixture("synthetic-fabric-crash-1.20.1.txt");
  const env = read(text);
  assert.equal(env.gameVersion?.value, "1.20.1");
  assert.equal(env.loader?.value, "fabric");
  assert.equal(env.loader?.detail, "0.15.7");
  assert.equal(env.java?.value, "17.0.9");
  assert.equal(env.java?.detail, "Eclipse Adoptium");
  assert.deepEqual(
    env.mods.map((m) => m.id),
    ["fabric-api", "fabricloader", "sodium", "java", "minecraft"],
  );

  const forged = text.replace(
    "Description: Exception in server tick loop",
    "Description: Minecraft Version: 1.12.2\n\tMinecraft Version: 1.12.2",
  );
  assert.equal(read(forged).gameVersion?.value, "1.20.1");
});

test("Forge launch arguments give the loader and the version", () => {
  const env = read(fixture("synthetic-forge-client-1.20.1.log"));
  assert.equal(env.gameVersion?.value, "1.20.1");
  assert.equal(env.loader?.value, "forge");
  assert.equal(env.loader?.detail, "47.2.0");
  assert.equal(env.loader?.confidence, "high");
});

test("Java crash file gives the Java version", () => {
  const env = read(fixture("synthetic-jvm-crash.txt"));
  assert.equal(env.java?.value, "17.0.9");
  assert.equal(env.java?.confidence, "high");
});

test("Fabric mod list in a normal log", () => {
  const env = read(
    [
      "[12:00:00] [main/INFO]: Loading Minecraft 1.20.1 with Fabric Loader 0.15.7",
      "[12:00:00] [main/INFO] (FabricLoader) Loading 2 mods:",
      "\t- fabric-api 0.92.0+1.20.1",
      "\t   \\-- fabric-api-base 0.4.32+1.20.1",
      "\t- sodium 0.5.8+mc1.20.1",
      "[12:00:01] [main/INFO]: done",
    ].join("\n"),
  );
  assert.deepEqual(env.mods.map((m) => m.id), ["fabric-api", "sodium"]);
  assert.equal(env.loader?.confidence, "high");
});

test("empty and unrelated text answer nothing", () => {
  for (const text of ["", "hello world\nsecond line", "key=value\nother=thing"]) {
    const env = read(text);
    assert.equal(env.gameVersion, undefined);
    assert.equal(env.loader, undefined);
    assert.equal(env.java, undefined);
    assert.deepEqual(env.mods, []);
  }
});

