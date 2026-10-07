import type { Rule } from "../types";

const LIST = /Unknown\/missing dependency plugins: \[([^\]]{1,200})\]/;
const OLD = /UnknownDependencyException: ([\w.-]{1,60})/;
const WHO = /to run '([^']{1,80})'/;
const FILE = /Could not load '([^']+)'/;

export const pluginMissingDependency: Rule = {
  id: "plugin-missing-dependency",
  read(line, { head }) {
    const short = line.slice(0, 1000);
    const list = LIST.exec(short);
    const old = list ? null : OLD.exec(short);
    const raw = list?.[1] ?? old?.[1];
    if (!raw) return null;

    const needed = [...new Set(raw.split(/,\s*/).map((part) => part.trim()).filter(Boolean))].slice(0, 6);
    const plugin =
      WHO.exec(short)?.[1] ??
      FILE.exec(head)?.[1]
        .split(/[\\/]/)
        .pop()
        ?.replace(/\.jar$/i, "") ??
      "A plugin";
    const names = needed.join(", ");

    return {
      key: `${plugin}>${names}`,
      message: `${plugin} needs ${names}, which isn't installed.`,
      solutions: [
        `Download ${names} from its official page for your server version and put it in the plugins folder.`,
        "Restart the server after adding it. Plugins are only picked up at startup.",
        `Or remove ${plugin} if you don't need it.`,
      ],
    };
  },
};
