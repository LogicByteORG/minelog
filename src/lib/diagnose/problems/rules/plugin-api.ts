import type { Rule } from "../types";

const VERSION = /InvalidPluginException: Unsupported API version (\d+(?:\.\d+){1,2})/;
const FILE = /Could not load '([^']+)'/;

export const pluginApi: Rule = {
  id: "plugin-needs-newer-server",
  read(line, { head }) {
    const version = VERSION.exec(line);
    if (!version) return null;

    const path = FILE.exec(head)?.[1];
    const file = path ? path.split(/[\\/]/).pop()! : null;
    const name = file ? file.replace(/\.jar$/i, "") : null;
    const label = name ?? "A plugin";

    const solutions = [
      `Update the server to Minecraft ${version[1]} or newer.`,
      `Or install an older version of ${name ?? "the plugin"} that was made for your server version.`,
    ];
    if (file) solutions.push(`Or remove ${file} from the plugins folder.`);

    return {
      key: `${name ?? ""}/${version[1]}`,
      message: `${label} needs Minecraft ${version[1]} or newer, and this server is older.`,
      solutions,
    };
  },
};

