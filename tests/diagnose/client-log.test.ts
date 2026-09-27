import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { readEnvironment } from "../../src/lib/diagnose";
import { modsText } from "../../src/lib/diagnose/present";
import { analyze, detectKind } from "../../src/lib/log";
import { redact } from "../../src/lib/redact";

const TEXT = readFileSync(
  new URL("../fixtures/real-fabric-client-integrated-1.21.11.log", import.meta.url),
  "utf8",
);

test("a client log with a built-in server is a client log", () => {
  assert.equal(detectKind(TEXT), "client");
  assert.equal(analyze(TEXT, true).kind, "client");
});

test("a dedicated server stays a server, and chat cannot make it a client", () => {
  const server = [
    "[12:00:00] [Server thread/INFO]: Starting minecraft server version 1.21.1",
    "[12:00:01] [Server thread/INFO]: <Steve> [Render thread/INFO]: Setting user: x",
    "[12:00:02] [Server thread/INFO]: Done (3.2s)! For help, type \"help\"",
  ].join("\n");
  assert.equal(detectKind(server), "server");
});

test("the setup of the client log reads clearly", () => {
  const env = readEnvironment(TEXT, "client");
  assert.equal(env.gameVersion?.value, "1.21.11");
  assert.equal(env.gameVersion?.confidence, "high");
  assert.equal(env.loader?.value, "fabric");
  assert.equal(env.loader?.detail, "0.19.5");
  assert.equal(env.loader?.confidence, "high");
  assert.equal(env.java?.value, "21");
  assert.equal(env.java?.confidence, "medium");
});

test("mods bundled inside others are counted but not listed", () => {
  const env = readEnvironment(TEXT, "client");
  assert.equal(env.mods.length, 10);
  assert.equal(env.bundled, 6);
  assert.equal(modsText(env.mods, env.bundled), "10 mods, and 6 bundled inside them");
  assert.equal(modsText(env.mods), "10 mods");
});

test("a four-part mod version is not taken for an IP address", () => {
  const { text } = redact(TEXT);
  assert.match(text, /- clumps 12\.0\.0\.4/);
  assert.equal(readEnvironment(text, "client").mods.find((m) => m.id === "clumps")?.version, "12.0.0.4");
});

test("real addresses are still hidden", () => {
  const { text } = redact(
    [
      "[12:00:00] [Render thread/INFO]: Connecting to 8.8.8.8, 25565",
      "[12:00:01] [Server thread/INFO]: Steve[/93.184.216.34:51234] logged in",
      "        - clumps 12.0.0.4",
      "           |-- helper 9.9.9.9",
      "Loading libs from 10.11.12.13 now",
    ].join("\n"),
  );
  assert.doesNotMatch(text, /8\.8\.8\.8|93\.184|10\.11\.12\.13/);
  assert.match(text, /- clumps 12\.0\.0\.4/);
  assert.match(text, /\|-- helper 9\.9\.9\.9/);
});

