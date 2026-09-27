import assert from "node:assert/strict";
import { test } from "node:test";
import { readEnvironment } from "../../src/lib/diagnose";
import { LAUNCHERS, launchersIn } from "../../src/lib/diagnose/launchers";

const line = (message: string) => `[12:00:00] [main/INFO]: ${message}\n`;

test("each launcher is found by its own folder, on either kind of slash", () => {
  const cases: [string, string][] = [
    ["LabyMod", String.raw`C:\Users\[redacted]\AppData\Roaming\.minecraft\labymod-neo\libraries\x.jar`],
    ["Modrinth App", String.raw`C:\Users\[redacted]\AppData\Roaming\ModrinthApp\profiles\1.21.11\config\yacl.json5`],
    ["Modrinth App", "/home/me/.local/share/com.modrinth.theseus/profiles/a/mods"],
    ["Prism Launcher", "/home/me/.local/share/PrismLauncher/instances/One/minecraft/mods"],
    ["MultiMC", String.raw`D:\Games\MultiMC\instances\Pack\.minecraft\logs`],
    ["CurseForge", String.raw`C:\Users\[redacted]\curseforge\minecraft\Instances\Pack\mods`],
    ["ATLauncher", String.raw`C:\Users\[redacted]\AppData\Roaming\ATLauncher\instances\Pack`],
    ["Lunar Client", "/home/me/.lunarclient/offline/multiver/logs"],
    ["Badlion Client", String.raw`C:\Program Files\Badlion Client\logs\launcher`],
  ];
  for (const [name, path] of cases) {
    assert.deepEqual(launchersIn(`Config file '${path}' loaded`), [name], path);
  }
  assert.equal(new Set(cases.map(([n]) => n)).size, LAUNCHERS.length);
});

test("the official launcher, a plain folder or a lookalike name give nothing", () => {
  assert.deepEqual(launchersIn(String.raw`C:\Users\[redacted]\AppData\Roaming\.minecraft\mods`), []);
  assert.deepEqual(launchersIn("see the modrinthapp-notes.txt file"), []);
  assert.deepEqual(launchersIn("MultiMCish/instances"), []);
});

test("the launcher is read from log lines and needs no special rule", () => {
  const env = readEnvironment(
    line(String.raw`Config file 'C:\Users\[redacted]\AppData\Roaming\ModrinthApp\profiles\1.21.11\config\a.json5' loaded`) +
      line(String.raw`Library C:\Users\[redacted]\AppData\Roaming\ModrinthApp\meta\libraries\x.jar`),
    "client",
  );
  assert.equal(env.launcher?.value, "Modrinth App");
  assert.equal(env.launcher?.confidence, "medium");
});

test("chat cannot name a launcher", () => {
  const env = readEnvironment(
    line("Starting minecraft server version 1.21.1") +
      "[12:00:01] [Server thread/INFO]: <Steve> C:\\Users\\a\\.lunarclient\\x is my folder\n",
    "server",
  );
  assert.equal(env.launcher, undefined);
});

test("two launchers in one log are a conflict, not a guess", () => {
  const env = readEnvironment(
    line("Config 'C:\\Users\\a\\AppData\\Roaming\\ModrinthApp\\profiles\\p\\a.json'") +
      line("Config 'C:\\Users\\a\\AppData\\Roaming\\PrismLauncher\\instances\\p\\b.json'"),
    "client",
  );
  assert.equal(env.launcher, undefined);
  assert.deepEqual(env.conflicts, ["launcher"]);
});

