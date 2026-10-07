import type { Rule } from "../types";
import { brokenModConfig } from "./broken-mod-config";
import { connectionRefused } from "./connection-refused";
import { crashReportSaved } from "./crash-report-saved";
import { damagedFile } from "./damaged-file";
import { datapackLoadFailed } from "./datapack-load-failed";
import { duplicateMod } from "./duplicate-mod";
import { eulaNotAccepted } from "./eula-not-accepted";
import { extractedMods } from "./extracted-mods";
import { fabricDependency } from "./fabric-dependency";
import { forgeDependency } from "./forge-dependency";
import { graphicsDriver } from "./graphics-driver";
import { invalidDist } from "./invalid-dist";
import { javaTooNew } from "./java-too-new";
import { javaVersion } from "./java-version";
import { jvmBadOption } from "./jvm-bad-option";
import { jvmHeapSetup } from "./jvm-heap-setup";
import { loginVerificationFailed } from "./login-verification-failed";
import { missingClass } from "./missing-class";
import { mixinFailed } from "./mixin-failed";
import { modCrashed } from "./mod-crashed";
import { nativeLibraryMissing } from "./native-library-missing";
import { nativeThread } from "./native-thread";
import { openglInvalidOperation } from "./opengl-invalid-operation";
import { outOfMemory } from "./out-of-memory";
import { overloaded } from "./overloaded";
import { pluginApi } from "./plugin-api";
import { pluginBrokenFile } from "./plugin-broken-file";
import { pluginDuplicate } from "./plugin-duplicate";
import { pluginEnableFailed } from "./plugin-enable-failed";
import { pluginMissingDependency } from "./plugin-missing-dependency";
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
  eulaNotAccepted,
  datapackLoadFailed,
  loginVerificationFailed,
  connectionRefused,
  fabricDependency,
  forgeDependency,
  duplicateMod,
  modCrashed,
  brokenModConfig,
  extractedMods,
  jvmHeapSetup,
  jvmBadOption,
  graphicsDriver,
  openglInvalidOperation,
  nativeLibraryMissing,
  missingClass,
  javaTooNew,
  pluginEnableFailed,
  pluginMissingDependency,
  pluginDuplicate,
  pluginBrokenFile,
  crashReportSaved,
];
