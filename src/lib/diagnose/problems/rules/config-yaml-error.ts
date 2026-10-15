import type { Rule } from "../types";

const YAML =
  /mapping values are not allowed here|while scanning for the next token|while parsing a block (?:mapping|collection)|found character '\\t' that cannot start any token|could not find expected ':'|while scanning a (?:simple key|quoted scalar)|expected <block end>, but found/;
const LOAD = /Cannot load [^\s]{0,200}?(plugins[\\/][^\s'":]{1,140}\.ya?ml)/;
const FILE = /(plugins[\\/][^\s'":]{1,140}\.ya?ml)/;

export const configYamlError: Rule = {
  id: "config-yaml-error",
  read(line, { head }) {
    const short = line.slice(0, 1000);
    const load = LOAD.exec(short);
    if (!load && !YAML.test(short)) return null;

    const file = load?.[1] ?? FILE.exec(head.slice(0, 400))?.[1] ?? null;
    const label = file ? file.replace(/^plugins[\\/]/, "") : null;
    return {
      key: file ?? "yaml",
      message: label
        ? `${label} has a formatting mistake, so the plugin can't read its settings.`
        : "A plugin's settings file has a formatting mistake, so the plugin can't read it.",
      solutions: [
        'The lines under this one say where. Look for "line N, column M" and open that file at that line.',
        "YAML doesn't allow tabs for indentation. Replace every tab with spaces.",
        'Put quotes around any value that contains a colon, like name: "Deforestation: Oak".',
        "Paste the file into a YAML checker like yamllint.com. It marks every mistake with a line number.",
        "If you can't find it, move the file away. Most plugins write a fresh default one on the next start, and you can copy your settings back from the old copy.",
      ],
    };
  },
};
