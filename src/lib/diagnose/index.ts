import type { LogKind } from "../log";
import {
  claimsFromDetails,
  claimsFromModList,
  claimsFromJvmCrash,
  claimsFromRecord,
  type Claim,
} from "./evidence";
import { readMods } from "./mods";
import { clipLine, parseRecords, systemDetails } from "./parse";
import { resolve } from "./resolve";
import type { Environment, EnvironmentKey } from "./types";

export type { Environment, Fact, ModEntry } from "./types";

const RECORD_WINDOW = 4000;

const KEYS: EnvironmentKey[] = ["gameVersion", "loader", "java", "launcher"];

export function readEnvironment(text: string, kind: LogKind): Environment {
  const lines = text.split(/\r?\n/).map(clipLine);
  const claims: Claim[] = [];

  const details = kind === "crash" ? systemDetails(lines) : [];
  const records =
    kind === "crash" || kind === "jvm" ? [] : parseRecords(lines).slice(0, RECORD_WINDOW);

  for (const record of records) claims.push(...claimsFromRecord(record, lines));
  if (kind === "crash") claims.push(...claimsFromDetails(details));
  if (kind === "jvm") claims.push(...claimsFromJvmCrash(lines));

  const { mods, bundled } = readMods(records, lines, details);
  if (kind !== "crash") claims.push(...claimsFromModList(mods));

  const environment: Environment = { conflicts: [], mods, bundled };

  for (const key of KEYS) {
    const answer = resolve(claims.filter((c) => c.about === key));
    if (answer.kind === "fact") environment[key] = answer.fact;
    else if (answer.kind === "conflict") environment.conflicts.push(key);
  }
  return environment;
}

