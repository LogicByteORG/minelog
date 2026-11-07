import type { Rule } from "../types";

const PATTERN = /Task #\d+ for (\S{1,60}) v(\S{1,40}) generated an exception/;

export const pluginTaskError: Rule = {
  id: "plugin-task-error",
  read(line) {
    const match = PATTERN.exec(line.slice(0, 1000));
    if (!match) return null;
    const [, plugin, version] = match;
    return {
      key: plugin,
      message: `A scheduled task from ${plugin} v${version} threw an error.`,
      solutions: [
        `Read the Caused by line under this one. It names the real error, and the first frame in ${plugin}'s own package shows where it broke.`,
        `Update ${plugin} to the newest build for your server version. Tasks that worked on an older server often break after an update.`,
        "If the trace runs through another plugin, like Vault or PlaceholderAPI, that one is missing or out of date.",
        `If the error repeats every few seconds, ${plugin} is failing on a timer. Remove it until there's a fix, so it stops flooding the log.`,
      ],
    };
  },
};
