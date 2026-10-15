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

test("Metaspace and direct buffer memory are told apart from the heap", () => {
  const meta = only(server("ERROR", "java.lang.OutOfMemoryError: Metaspace"), "memory-region-exhausted");
  assert.match(meta[0].message, /class data/);
  assert.ok(meta[0].solutions[0].includes("MaxMetaspaceSize"));

  const direct = only(
    server("ERROR", "java.lang.OutOfMemoryError: Cannot reserve 262144 bytes of direct buffer memory (allocated: 1073479680, limit: 1073741824)"),
    "memory-region-exhausted",
  );
  assert.match(direct[0].message, /off-heap/);

  assert.ok(!ids(server("ERROR", "java.lang.OutOfMemoryError: Java heap space")).includes("memory-region-exhausted"));
});

test("a crash inside a graphics driver names the vendor, once per vendor", () => {
  const text = [
    "#",
    "# A fatal error has been detected by the Java Runtime Environment:",
    "#",
    "#  EXCEPTION_ACCESS_VIOLATION (0xc0000005) at pc=0x00007ff8a1b2c3d4, pid=1234, tid=5678",
    "#",
    "# Problematic frame:",
    "# C  [nvoglv64.dll+0x3a4b2c]",
    "",
    "Native frames: (J=compiled Java code, j=interpreted, Vv=VM code, C=native code)",
    "C  [nvoglv64.dll+0x3a4b2c]",
    "C  [nvoglv64.dll+0x3a4b99]",
  ].join("\n");
  const found = only(text, "graphics-driver-crash", "jvm");
  assert.equal(found.length, 1);
  assert.equal(found[0].count, 3);
  assert.match(found[0].message, /NVIDIA graphics driver \(nvoglv64\.dll\)/);

  const intel = only("# C  [ig9icd64.dll+0x1234ab]", "graphics-driver-crash", "jvm");
  assert.match(intel[0].message, /Intel/);

  const mesa = only("C  [iris_dri.so+0x9a1b2c]", "graphics-driver-crash", "jvm");
  assert.match(mesa[0].message, /Intel/);

  assert.ok(!ids("# C  [jvm.dll+0x4f2a31]", "jvm").includes("graphics-driver-crash"));
});

test("a broken plugin config names the file and folds the wrapped lines", () => {
  const text = [
    server("ERROR", "Cannot load plugins/ClueScrolls/config.yml"),
    "org.bukkit.configuration.InvalidConfigurationException: mapping values are not allowed here",
    " in 'reader', line 12, column 20:",
    "        clueName: Deforestation: Oak",
  ].join("\n");
  const found = only(text, "config-yaml-error");
  assert.equal(found.length, 1);
  assert.equal(found[0].count, 2);
  assert.match(found[0].message, /^ClueScrolls\/config\.yml has a formatting mistake/);
  assert.ok(found[0].solutions.some((s) => s.includes("tabs")));
});

test("a tab in a YAML file is caught even when the file isn't named", () => {
  const text = [
    server("ERROR", "Could not load configuration"),
    "while scanning for the next token",
    "found character '\\t' that cannot start any token. (Do not use \\t(TAB) for indentation)",
  ].join("\n");
  const [p] = only(text, "config-yaml-error");
  assert.match(p.message, /A plugin's settings file/);
});

test("a configuration message without any YAML error stays quiet", () => {
  assert.ok(!ids(server("INFO", "Cannot load configuration from stream, using defaults")).includes("config-yaml-error"));
});

test("database errors keep unreachable, refused and missing apart", () => {
  const down = only(
    server("ERROR", "com.mysql.cj.jdbc.exceptions.CommunicationsException: Communications link failure"),
    "database-connection",
  );
  assert.equal(down.length, 1);
  assert.match(down[0].message, /couldn't reach its database/);

  const denied = only(
    server("ERROR", "java.sql.SQLException: Access denied for user 'mc'@'10.0.0.5' (using password: YES)"),
    "database-connection",
  );
  assert.match(denied[0].message, /refused the plugin's login/);

  const missing = only(
    server("ERROR", "java.sql.SQLSyntaxErrorException: Unknown database 'minecraft'"),
    "database-connection",
  );
  assert.match(missing[0].message, /doesn't exist/);
});

test("a plugin loaded twice points at /reload", () => {
  const [p] = only(
    server("ERROR", "java.lang.IllegalArgumentException: Plugin already initialized!"),
    "plugin-already-initialized",
  );
  assert.ok(p.solutions[0].includes("/reload"));
});

test("a Fabric jar in a Forge folder is named", () => {
  const text = server(
    "WARN",
    "Mod file /srv/mc/mods/beenfo-1.16.4-fabric0.25.1-1.3.jar is missing mods.toml file",
  );
  const [p] = only(text, "not-a-forge-mod");
  assert.match(p.message, /^beenfo-1\.16\.4-fabric0\.25\.1-1\.3\.jar is a Fabric or Quilt mod/);

  const plain = only(
    server("ERROR", "File /srv/mc/mods/tool.jar is not a valid mod file"),
    "not-a-forge-mod",
  );
  assert.match(plain[0].message, /^tool\.jar doesn't look like a Forge or NeoForge mod/);
});

test("Forge's own library jars in the libraries folder are not flagged", () => {
  const text = at(
    "main",
    "WARN",
    "Mod file /data/libraries/net/minecraftforge/fmlcore/1.20.1-47.4.0/fmlcore-1.20.1-47.4.0.jar is missing mods.toml file",
  );
  assert.ok(!ids(text).includes("not-a-forge-mod"));
});

test("the three Java launcher jar errors give three different answers", () => {
  const access = only("Error: Unable to access jarfile server.jar", "server-jar-invalid");
  assert.match(access[0].message, /couldn't open server\.jar/);

  const corrupt = only("Error: Invalid or corrupt jarfile server.jar", "server-jar-invalid");
  assert.match(corrupt[0].message, /isn't a complete jar file/);

  const manifest = only("no main manifest attribute, in luckperms.jar", "server-jar-invalid");
  assert.ok(manifest[0].solutions.some((s) => s.includes("run script")));
});

test("Windows native exit codes are explained, a normal exit is not", () => {
  const a = only(at("main", "ERROR", "Process exited with code -1073740791."), "native-crash-exit-code", "client");
  assert.match(a[0].message, /0xC0000409/);

  const b = only(at("main", "ERROR", "Game crashed! Exit code: -1073741819"), "native-crash-exit-code", "client");
  assert.match(b[0].message, /0xC0000005/);

  const unsigned = only(at("main", "ERROR", "Process exited with code 3221226505"), "native-crash-exit-code", "client");
  assert.match(unsigned[0].message, /0xC0000409/);

  assert.ok(!ids(at("main", "INFO", "Process exited with code 0"), "client").includes("native-crash-exit-code"));
  assert.ok(!ids(at("main", "ERROR", "Process exited with code 1"), "client").includes("native-crash-exit-code"));
});

test("binary incompatibility is named, and the Java module case stays with java-too-new", () => {
  const [p] = only(
    server("ERROR", "java.lang.IncompatibleClassChangeError: Class a.b.Foo does not implement the requested interface java.util.function.Supplier"),
    "binary-incompatible",
  );
  assert.match(p.message, /IncompatibleClassChangeError/);
  assert.ok(p.solutions[0].includes("java.util.function.Supplier"));

  const moduleLog = server(
    "ERROR",
    "java.lang.IllegalAccessError: class cpw.mods.Foo cannot access class sun.security.util.ManifestEntryVerifier (in module java.base) because module java.base does not export sun.security.util to unnamed module",
  );
  assert.ok(!ids(moduleLog).includes("binary-incompatible"));
  assert.ok(ids(moduleLog).includes("java-too-new"));
});
