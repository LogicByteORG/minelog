import type { Rule } from "../types";

const FABRIC = /Could not execute entrypoint stage '([^']{1,40})' due to errors, provided by '([^']{1,80})'/;
const FORGE = /LoaderExceptionModCrash: Caught exception from (.{1,80}?) \(([^)]{1,60})\)/;
const INSTANCE = /Failed to create mod instance\. ModID: ([^,\s]{1,60}),/;

export const modCrashed: Rule = {
  id: "mod-crashed",
  read(line) {
    const short = line.slice(0, 1000);

    const fabric = FABRIC.exec(short);
    const forge = fabric ? null : FORGE.exec(short);
    const instance = fabric || forge ? null : INSTANCE.exec(short);

    const id = fabric?.[2] ?? forge?.[2] ?? instance?.[1];
    if (!id) return null;
    const name = forge && forge[1] !== id ? `${forge[1]} (${id})` : id;

    return {
      key: id,
      message: `The mod ${name} crashed while the game was starting.`,
      solutions: [
        `Update ${id} to the version made for your game version and loader. Update the mods that depend on it too.`,
        `Remove ${id} and start again to confirm it is the cause.`,
        "The lines right after this one hold the real error. If it keeps happening, send this log to the mod's author.",
      ],
    };
  },
};
