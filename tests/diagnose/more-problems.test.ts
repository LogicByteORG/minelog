import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { test } from "node:test";
import { readInsights } from "../../src/lib/diagnose/insights";
import { MAX_PROBLEMS } from "../../src/lib/diagnose/problems";
import { RULES } from "../../src/lib/diagnose/problems/rules";
import type { LogKind } from "../../src/lib/log";

const problems = (text: string, kind: LogKind = "server") => readInsights(text, kind).problems;
const ids = (text: string, kind: LogKind = "server") => problems(text, kind).map((p) => p.id);
const only = (text: string, id: string, kind: LogKind = "server") => {
  const found = problems(text, kind).filter((p) => p.id === id);
  assert.ok(found.length > 0, `expected ${id}, got ${ids(text, kind).join(", ") || "nothing"}`);
  return found;
};

const at = (level: string, ...messages: string[]) =>
  messages.map((m, i) => `[12:00:${String(i).padStart(2, "0")}] [main/${level}]: ${m}`).join("\n");

test("the EULA line says what to change in eula.txt", () => {
  const [p] = only(
    at("WARN", "You need to agree to the EULA in order to run the server. Go to eula.txt for more info."),
    "eula-not-accepted",
  );
  assert.match(p.solutions[0], /eula=true/);
});

test("a data pack that can't load stops the server and points at --safeMode", () => {
  const [p] = only(
    at(
      "ERROR",
      "Failed to load datapacks, can't proceed with server load. You can either fix your datapacks or reset to vanilla with --safeMode",
    ),
    "datapack-load-failed",
  );
  assert.ok(p.solutions.some((s) => s.includes("--safeMode")));
});

test("login failures tell an unreachable Mojang from a rejected account", () => {
  const down = only(
    at("ERROR", "Couldn't verify username because servers are unavailable"),
    "login-verification-failed",
  );
  assert.match(down[0].message, /couldn't reach Mojang/);

  const rejected = only(
    at("INFO", "Disconnecting Steve: Failed to verify username!"),
    "login-verification-failed",
  );
  assert.match(rejected[0].message, /couldn't be verified/);
});

test("connection refused reads the plain Java wording", () => {
  only(at("ERROR", "java.net.ConnectException: Connection refused: no further information"), "connection-refused");
});

test("Fabric names the mod and the dependency that is missing", () => {
  const text = [
    at("ERROR", "Incompatible mods found!"),
    "\t - Mod 'Chunk By Chunk' (chunkbychunk) 2.2.3 requires any version of fabric, which is missing!",
  ].join("\n");
  const [p] = only(text, "fabric-dependency");
  assert.equal(p.message, "Chunk By Chunk needs Fabric API, which isn't installed.");
  assert.match(p.solutions[0], /modrinth\.com\/mod\/fabric-api/);
  assert.deepEqual(ids(text), ["fabric-dependency"]);
});

test("Fabric says which version the mod wanted and which one you have", () => {
  const text = [
    at("ERROR", "net.fabricmc.loader.impl.FormattedException: Some of your mods are incompatible with the game or each other!"),
    "\t - Mod 'Auto Workstations' (auto-workstations) 1.0-rc.21 requires version 0.15.3 or later of mod 'Fabric Loader' (fabricloader), but only the wrong version is present: 0.14.21!",
  ].join("\n");
  const [p] = only(text, "fabric-dependency");
  assert.equal(p.message, "Auto Workstations needs Fabric Loader, version 0.15.3 or later, but you have 0.14.21.");
  assert.match(p.solutions[0], /Update Fabric Loader/);
});

test("Fabric mods that break each other are named together", () => {
  const text = [
    at("ERROR", "Incompatible mods found!"),
    "\t - Mod 'Alpha' (alpha) 1.0.0 is incompatible with any version of mod 'Beta' (beta), yet a conflicting version is present: 2.1.0!",
  ].join("\n");
  const [p] = only(text, "fabric-dependency");
  assert.equal(p.message, "Alpha and Beta can't be used together.");
});

test("Forge dependency lines name the requester, the mod and the range", () => {
  const text = [
    at("ERROR", "Missing or unsupported mandatory dependencies:"),
    "\tMod ID: 'geckolib', Requested by: 'cataclysm', Expected range: '[4.4,)', Actual version: '[MISSING]'",
    "\tMod ID: 'forge', Requested by: 'create', Expected range: '[47.2.0,)', Actual version: '47.1.0'",
  ].join("\n");
  const found = only(text, "forge-dependency");
  assert.equal(found.length, 2);
  assert.equal(found[0].message, "cataclysm needs geckolib, which isn't installed.");
  assert.equal(found[1].message, "create needs Forge 47.2.0 or newer, but you have 47.1.0.");
});

test("older Forge puts the whole list on one line", () => {
  const [p] = only(
    at("ERROR", "Missing mandatory dependencies: forge, sophisticatedcore, forge, geckolib3"),
    "forge-dependency",
  );
  assert.match(p.message, /forge, sophisticatedcore, geckolib3\./);
});

test("a mod installed twice lists the files it came from", () => {
  const [p] = only(
    at("ERROR", "Mod ID: 'jei' from mod files: jei-1.20.1-15.2.0.jar, jei-1.20.1-15.3.0.jar"),
    "duplicate-mod",
  );
  assert.equal(
    p.message,
    "jei is in the mods folder more than once (jei-1.20.1-15.2.0.jar and jei-1.20.1-15.3.0.jar).",
  );
  const [old] = only(
    at("ERROR", "Found a duplicate mod jei at [mods/a.jar, mods/b.jar]"),
    "duplicate-mod",
  );
  assert.match(old.message, /a\.jar and b\.jar/);
});

test("a crashing mod is named, on Fabric and on Forge", () => {
  const [fabric] = only(
    at(
      "ERROR",
      "Could not execute entrypoint stage 'main' due to errors, provided by 'badmod'!",
    ),
    "mod-crashed",
  );
  assert.equal(fabric.message, "The mod badmod crashed while the game was starting.");

  const [forge] = only(
    at("ERROR", "LoaderExceptionModCrash: Caught exception from Bad Mod (badmod)"),
    "mod-crashed",
  );
  assert.equal(forge.message, "The mod Bad Mod (badmod) crashed while the game was starting.");
});

test("a broken config names the file and the mod", () => {
  const [p] = only(
    at("ERROR", "Failed loading config file mymod-common.toml of type COMMON for modid mymod: broken"),
    "broken-mod-config",
  );
  assert.match(p.message, /mymod-common\.toml for mymod/);
  only(
    at("ERROR", "com.electronwill.nightconfig.core.io.ParsingException: Not enough data available"),
    "broken-mod-config",
  );
});

test("an unzipped mod folder is called out", () => {
  only(
    at("ERROR", "Extracted mod jars found, loading will NOT continue"),
    "extracted-mods",
  );
});

test("Java heap setup errors point at -Xmx and 32-bit Java", () => {
  const [p] = only(
    "Error occurred during initialization of VM\nCould not reserve enough space for 2097152KB object heap",
    "jvm-heap-setup",
    "client",
  );
  assert.ok(p.solutions.some((s) => s.includes("-Xmx")));
  only("Invalid maximum heap size: -Xmx16G", "jvm-heap-setup", "client");
});

test("an unknown Java option is named", () => {
  const [p] = only("Unrecognized VM option 'UseConcMarkSweepGC'", "jvm-bad-option", "client");
  assert.match(p.message, /UseConcMarkSweepGC/);
});

test("graphics driver problems cover GLFW 65542 and GLX", () => {
  only(
    at("ERROR", "GLFW error 65542: WGL: The driver does not appear to support OpenGL."),
    "graphics-driver",
    "client",
  );
  only(at("ERROR", "GLX: Failed to create context: GLXBadFBConfig"), "graphics-driver", "client");
});

test("OpenGL 1282 mentions shader packs first", () => {
  const [p] = only(at("ERROR", "########## GL ERROR ##########\n@ Post render\n1282: Invalid operation"), "opengl-invalid-operation", "client");
  assert.match(p.solutions[0], /shader pack/);
});

test("a missing native library is named", () => {
  const [p] = only(
    at("ERROR", "java.lang.UnsatisfiedLinkError: Failed to locate library: lwjgl.dll"),
    "native-library-missing",
    "client",
  );
  assert.match(p.message, /lwjgl\.dll/);
});

test("missing classes group by package and ignore 'Could not initialize class'", () => {
  const text = at(
    "ERROR",
    "java.lang.NoClassDefFoundError: net/minecraftforge/fml/common/Mod",
    "java.lang.NoClassDefFoundError: net/minecraftforge/fml/common/Loader",
    "java.lang.NoSuchMethodError: com.example.mod.Api.run(Lcom/example/Ctx;)V",
  );
  const found = only(text, "missing-class");
  assert.equal(found.length, 2);
  assert.equal(found[0].count, 2);
  assert.match(found[0].message, /net\.minecraftforge\.fml\.common\.Mod/);

  assert.deepEqual(
    ids(at("ERROR", "java.lang.NoClassDefFoundError: Could not initialize class foo.Bar")),
    ["unknown-error"],
  );

  // A probe for an optional class is logged as a warning and is not a problem.
  assert.deepEqual(
    ids(at("WARN", "Error loading class: a/b/Config (java.lang.ClassNotFoundException: a/b/Config)")),
    [],
  );
});

test("an old reader meeting new Java names the Java version", () => {
  const [p] = only(
    at("ERROR", "java.lang.IllegalArgumentException: Unsupported class file major version 65"),
    "java-too-new",
  );
  assert.match(p.message, /Java 21/);
  const [modules] = only(
    at("ERROR", "java.lang.reflect.InaccessibleObjectException: Unable to make protected final java.lang.Class java.lang.ClassLoader.defineClass(java.lang.String,byte[],int,int) accessible"),
    "java-too-new",
  );
  assert.match(modules.message, /older game/);
});

test("plugin enable failures name the plugin and version", () => {
  const [p] = only(
    at("ERROR", "Error occurred while enabling WorldEdit v7.2.0 (Is it up to date?)"),
    "plugin-enable-failed",
  );
  assert.equal(p.message, "WorldEdit v7.2.0 crashed while the server was switching it on.");
});

test("a missing plugin dependency names both plugins", () => {
  const text = [
    "[12:00:00] [Server thread/ERROR]: Could not load 'plugins/ShopGUI.jar' in folder 'plugins'",
    "org.bukkit.plugin.UnknownDependencyException: Unknown/missing dependency plugins: [Vault, Essentials]. Please download and install these plugins to run 'ShopGUI'.",
  ].join("\n");
  const [p] = only(text, "plugin-missing-dependency");
  assert.equal(p.message, "ShopGUI needs Vault, Essentials, which isn't installed.");
});

test("two copies of one plugin are named by file", () => {
  const [p] = only(
    at(
      "ERROR",
      "Ambiguous plugin name `Essentials' for files `plugins\\Essentials-2.19.jar' and `plugins\\Essentials-2.20.jar' in `plugins'",
    ),
    "plugin-duplicate",
  );
  assert.equal(
    p.message,
    "Two files in the plugins folder are both Essentials (Essentials-2.19.jar and Essentials-2.20.jar).",
  );
});

test("a jar without plugin.yml is named from the load line", () => {
  const text = [
    "[12:00:00] [Server thread/ERROR]: Could not load 'plugins/sodium-fabric-0.5.jar' in folder 'plugins'",
    "org.bukkit.plugin.InvalidPluginException: java.lang.IllegalArgumentException: Jar does not contain plugin.yml",
  ].join("\n");
  const [p] = only(text, "plugin-broken-file");
  assert.match(p.message, /sodium-fabric-0\.5\.jar isn't a working plugin/);
});

test("a saved crash report is named, but the report itself isn't flagged", () => {
  const log = at("ERROR", "This crash report has been saved to: C:\\mc\\crash-reports\\crash-2026-10-07_12.00.00-client.txt");
  const [p] = only(log, "crash-report-saved", "client");
  assert.match(p.solutions[0], /crash-2026-10-07_12\.00\.00-client\.txt/);

  const report = [
    "---- Minecraft Crash Report ----",
    "Time: 2026-10-07 12:00:00",
    "Description: Exception in server tick loop",
    "",
    "This crash report has been saved to: /srv/crash-reports/crash.txt",
  ].join("\n");
  assert.ok(!ids(report, "crash").includes("crash-report-saved"));
});

test("every rule id is kebab-case and unique", () => {
  const all = RULES.map((rule) => rule.id);
  assert.equal(new Set(all).size, all.length);
  for (const id of all) assert.match(id, /^[a-z0-9]+(-[a-z0-9]+)*$/);
});

test("the real logs on file don't gain a rule hit that isn't about a real problem", () => {
  const dir = new URL("../fixtures/", import.meta.url);
  const added = new Set([
    "eula-not-accepted", "datapack-load-failed", "login-verification-failed", "connection-refused",
    "fabric-dependency", "forge-dependency", "duplicate-mod", "mod-crashed", "broken-mod-config",
    "extracted-mods", "jvm-heap-setup", "jvm-bad-option", "graphics-driver", "opengl-invalid-operation",
    "native-library-missing", "missing-class", "java-too-new", "plugin-enable-failed",
    "plugin-missing-dependency", "plugin-duplicate", "plugin-broken-file", "crash-report-saved",
  ]);
  const hits: string[] = [];
  for (const name of readdirSync(dir)) {
    const text = readFileSync(new URL(name, dir), "utf8");
    const kind: LogKind = name.includes("jvm") ? "jvm" : name.includes("crash") ? "crash" : /client|labymod/.test(name) ? "client" : "server";
    for (const p of problems(text, kind)) if (added.has(p.id)) hits.push(`${name}: ${p.id}`);
  }
  assert.deepEqual(hits.sort(), [
    "real-forge-server-1.20.1.log: crash-report-saved",
    "real-labymod-fabric-26.2.log: fabric-dependency",
    "real-neoforge-server-1.21.1.log: crash-report-saved",
  ]);
});

test("a flood of one problem still counts as one entry", () => {
  const flood = Array.from({ length: 200 }, (_, i) =>
    at("ERROR", `Error occurred while enabling Plugin${i % 3} v1 (Is it up to date?)`),
  ).join("\n");
  const found = problems(flood).filter((p) => p.id === "plugin-enable-failed");
  assert.equal(found.length, 3);
  assert.ok(problems(flood).length <= MAX_PROBLEMS);
});
