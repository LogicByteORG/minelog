import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { analyze } from "../src/lib/log";
import { isPrivateFileName, looksLikeEnvFile } from "../src/lib/private-files";

test("a pasted env file with secrets is refused", () => {
  const text = [
    "# app",
    "NODE_ENV=production",
    "DATABASE_URL=postgres://app:hunter2@db.example.com:5432/app",
    'API_KEY="abc123def456"',
    "export PORT=3000",
  ].join("\n");
  assert.equal(looksLikeEnvFile(text), true);
  const result = analyze(text, true);
  assert.equal(result.blocked, true);
  assert.match(result.blockMessage ?? "", /environment file/);
});

test("windows line endings and quoted values still count", () => {
  const text = 'SECRET_KEY="s3cr3t-value"\r\nDEBUG=1\r\nHOST=0.0.0.0\r\n';
  assert.equal(looksLikeEnvFile(text), true);
});

test("a secret-looking value is enough when the key is plain", () => {
  const text = "NAME=bot\nREGION=eu\nDEPLOY=ghp_abcdefghijklmnopqrstuvwxyz0123\n";
  assert.equal(looksLikeEnvFile(text), true);
});

test("a docker minecraft env file with nothing private is allowed", () => {
  const text = "EULA=TRUE\nTYPE=PAPER\nVERSION=1.21.11\nMEMORY=4G\n";
  assert.equal(looksLikeEnvFile(text), false);
});

test("placeholders are not secrets", () => {
  const text = "API_KEY=\nSECRET=changeme\nTOKEN=<your token>\nPORT=25565\n";
  assert.equal(looksLikeEnvFile(text), false);
});

test("logs, properties files and one stray line are allowed", () => {
  assert.equal(looksLikeEnvFile("motd=A Minecraft Server\nserver-port=25565\nonline-mode=true\n"), false);
  assert.equal(
    looksLikeEnvFile("[12:00:01] [Server thread/INFO]: PASSWORD=x is not a good one\nline\nline\n"),
    false,
  );
  assert.equal(looksLikeEnvFile("JAVA_HOME=/usr/lib/jvm\nDB_PASSWORD=x\n"), false);
});

test("real logs from the fixtures are never taken for env files", () => {
  for (const name of [
    "real-fabric-1.21.11.log",
    "real-forge-server-1.20.1.log",
    "real-forge-crash-1.20.1.txt",
    "real-paper-1.21.11.log",
    "synthetic-jvm-crash.txt",
  ]) {
    const text = readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8");
    assert.equal(looksLikeEnvFile(text), false, name);
  }
});

test("env file names are still refused", () => {
  assert.equal(isPrivateFileName(".env.local"), true);
  assert.equal(isPrivateFileName("latest.log"), false);
});
