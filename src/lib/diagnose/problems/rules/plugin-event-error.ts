import type { Rule } from "../types";

const PATTERN = /Could not pass event (\w{1,80}) to (\S{1,60}) v(\S{1,40})/;

export const pluginEventError: Rule = {
  id: "plugin-event-error",
  read(line) {
    const match = PATTERN.exec(line.slice(0, 1000));
    if (!match) return null;
    const [, event, plugin, version] = match;
    return {
      key: plugin,
      message: `${plugin} v${version} hit an error while handling ${event}.`,
      solutions: [
        `Look for the Caused by line under this one. It names the real error, and the first frame with ${plugin}'s own package shows where it broke.`,
        `Update ${plugin} to the newest build for your server version. An old plugin on a new server is the most common cause.`,
        "If the trace runs through another plugin, like Vault or PlaceholderAPI, that one is missing or out of date.",
        `If it fails every time that event happens, ${plugin} is breaking it for everyone. Remove it until there's a fix.`,
      ],
    };
  },
};
