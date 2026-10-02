import type { Rule } from "../types";
import { damagedFile } from "./damaged-file";
import { invalidDist } from "./invalid-dist";
import { javaVersion } from "./java-version";
import { mixinFailed } from "./mixin-failed";
import { nativeThread } from "./native-thread";
import { outOfMemory } from "./out-of-memory";
import { overloaded } from "./overloaded";
import { pluginApi } from "./plugin-api";
import { portBind } from "./port-bind";
import { serverFull } from "./server-full";
import { systemMemory } from "./system-memory";
import { timedOut } from "./timed-out";
import { wrongLoader } from "./wrong-loader";

export const RULES: Rule[] = [
  outOfMemory,
  nativeThread,
  systemMemory,
  javaVersion,
  overloaded,
  portBind,
  invalidDist,
  pluginApi,
  damagedFile,
  mixinFailed,
  wrongLoader,
  timedOut,
  serverFull,
];

