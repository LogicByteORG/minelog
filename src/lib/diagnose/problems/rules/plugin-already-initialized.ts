import type { Rule } from "../types";

const PATTERN = /IllegalArgumentException: Plugin already initialized!/;

export const pluginAlreadyInitialized: Rule = {
  id: "plugin-already-initialized",
  read(line) {
    if (!PATTERN.test(line.slice(0, 1000))) return null;
    return {
      key: "twice",
      message: "A plugin was loaded a second time while the first copy was still in memory.",
      solutions: [
        "Restart the server instead of using /reload. Java can't safely unload code that is already running, and Spigot and Paper advise against /reload.",
        "Don't replace a plugin's jar while the server is running. Stop the server, swap the file, then start it again.",
        "Check the plugins folder for two copies of the same plugin, like an old version next to a new one, and remove the extra.",
      ],
    };
  },
};
