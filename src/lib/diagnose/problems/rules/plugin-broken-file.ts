import type { Rule } from "../types";
import { baseName } from "./text";

const PATTERN =
  /Jar does not contain (?:paper-)?plugin\.yml|InvalidDescriptionException: Invalid plugin\.yml|InvalidPluginException: Cannot find main class `[^']{1,120}'/;
const FILE = /Could not load '([^']+)'/;

export const pluginBrokenFile: Rule = {
  id: "plugin-broken-file",
  read(line, { head }) {
    if (!PATTERN.test(line.slice(0, 1000))) return null;
    const path = FILE.exec(head)?.[1];
    const file = path ? baseName(path) : null;
    const label = file ?? "A file in the plugins folder";
    return {
      key: file ?? "unknown",
      message: `${label} isn't a working plugin for this server.`,
      solutions: [
        "Make sure the file is a plugin for Bukkit, Spigot or Paper. A Fabric or Forge mod doesn't work as a plugin, even though it is also a .jar file.",
        "Download the plugin again from its official page. A download that stopped halfway leaves a file the server can't read.",
        file ? `Or remove ${file} from the plugins folder.` : "Or remove the file from the plugins folder.",
      ],
    };
  },
};
