import type { Rule } from "../types";

const PATTERN = /Error occurred while enabling (\S{1,60}?)(?: (\S{1,40}))? \(Is it up to date\?\)/;

export const pluginEnableFailed: Rule = {
  id: "plugin-enable-failed",
  read(line) {
    const match = PATTERN.exec(line.slice(0, 1000));
    if (!match) return null;
    const name = match[1];
    const version = match[2] ? ` ${match[2]}` : "";
    return {
      key: name,
      message: `${name}${version} crashed while the server was switching it on.`,
      solutions: [
        `Update ${name} to the version made for your server version. An old plugin on a new server is the most common cause.`,
        "Look at the Caused by line right under this one. It names the real reason, like a missing plugin, a broken config file or a wrong database login.",
        `If it keeps failing, remove ${name} from the plugins folder so the rest of the server can start.`,
      ],
    };
  },
};
