import type { Rule } from "../types";
import { baseName } from "./text";

const PATTERN = /(?:This c|C)rash report (?:has been )?saved to:?\s*(?:#@!@# )?(\S.{0,200})/;

export const crashReportSaved: Rule = {
  id: "crash-report-saved",
  read(line, { kind }) {
    if (kind === "crash" || kind === "jvm") return null;
    const match = PATTERN.exec(line.slice(0, 1000));
    if (!match) return null;
    const file = baseName(match[1].trim());
    return {
      key: file,
      message: "The game crashed and wrote a crash report. The real cause is inside that file.",
      solutions: [
        `Open ${file} in the crash-reports folder next to this log, and upload it here too. Its first lines say what went wrong.`,
        "In the crash report, the Description line and the first Caused by line usually name the mod or setting behind the crash.",
      ],
    };
  },
};
