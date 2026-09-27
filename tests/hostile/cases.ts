import { readEnvironment } from "../../src/lib/diagnose";
import { readInsights } from "../../src/lib/diagnose/insights";
import { analyze, detectKind } from "../../src/lib/log";
import { redact } from "../../src/lib/redact";

const MB = 1024 * 1024;
const HEADER = "[12:00:00] [main/INFO]: ";
const rep = (piece: string, times: number) => piece.repeat(times);

export const CASES: Record<string, () => string> = {
  "unsupported class version repeated": () =>
    "java.lang.UnsupportedClassVersionError: " + rep("class file version 1) ", 200_000),
  "open brackets": () => rep("[", 4 * MB),
  "digits and dots": () => rep("1.", 2 * MB),
  "version dots after a banner": () => "Starting minecraft server version " + rep("1.", 1_000_000),
  "carriage returns": () => rep("\r", 4 * MB),
  "line breaks only": () => rep("\n", 4 * MB),
  "line breaks and spaces": () => rep("\n ", 2 * MB),
  "bootstrap semicolons": () =>
    HEADER + "[bootstrap] Running Java 21 (" + rep("; ", 2_000_000),
  "plugin list open brackets": () =>
    HEADER + "[PluginInitializerManager] Bukkit plugins (5):\n- " + rep("a (", 1_300_000),
  "address run with no at sign": () => "x@" + rep("a.", 2 * MB),
  "web token starts": () => rep("eyJ", 1_300_000),
  "one huge line": () => rep("a", 4 * MB),
  "header spam": () => rep("[12:00:00] [" + "x".repeat(50) + "/", 50_000),
  "tabs": () => rep("\t", 4 * MB),
  "markdown link starts": () => rep("![a](", 800_000),
  "table pipes": () => rep("| a ", 900_000),
  "exception dots": () => rep("a.", 2 * MB),
};

export const STAGES: Record<string, (text: string) => unknown> = {
  redact: (text) => redact(text),
  detectKind: (text) => detectKind(text),
  analyze: (text) => analyze(text, true),
  "insights (server log)": (text) => readInsights(text, "server"),
  "insights (crash report)": (text) => readInsights(text, "crash"),
  "environment (server log)": (text) => readEnvironment(text, "server"),
};

