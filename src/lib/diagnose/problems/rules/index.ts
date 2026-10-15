import type { Rule } from "../types";
import { asyncApiCall } from "./async-api-call";
import { brokenModConfig } from "./broken-mod-config";
import { clientLoginFailed } from "./client-login-failed";
import { connectionRefused } from "./connection-refused";
import { connectionThrottled } from "./connection-throttled";
import { crashReportSaved } from "./crash-report-saved";
import { damagedFile } from "./damaged-file";
import { datapackLoadFailed } from "./datapack-load-failed";
import { diskFull } from "./disk-full";
import { duplicateMod } from "./duplicate-mod";
import { eulaNotAccepted } from "./eula-not-accepted";
import { extractedMods } from "./extracted-mods";
import { fabricDependency } from "./fabric-dependency";
import { flyingKick } from "./flying-kick";
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
import { modSetMismatch } from "./mod-set-mismatch";
import { nativeLibraryMissing } from "./native-library-missing";
import { nativeThread } from "./native-thread";
import { notWhitelisted } from "./not-whitelisted";
import { openglInvalidOperation } from "./opengl-invalid-operation";
import { outOfMemory } from "./out-of-memory";
import { overloaded } from "./overloaded";
import { packetDecodeError } from "./packet-decode-error";
import { pluginApi } from "./plugin-api";
import { pluginBrokenFile } from "./plugin-broken-file";
import { pluginDuplicate } from "./plugin-duplicate";
import { pluginEnableFailed } from "./plugin-enable-failed";
import { pluginEventError } from "./plugin-event-error";
import { pluginMissingDependency } from "./plugin-missing-dependency";
import { portBind } from "./port-bind";
import { profileKeyError } from "./profile-key-error";
import { proxyForwarding } from "./proxy-forwarding";
import { serverFull } from "./server-full";
import { serverWatchdog } from "./server-watchdog";
import { sessionLock } from "./session-lock";
import { sslCertificate } from "./ssl-certificate";
import { systemMemory } from "./system-memory";
import { tickingCrash } from "./ticking-crash";
import { timedOut } from "./timed-out";
import { tooManyOpenFiles } from "./too-many-open-files";
import { unknownHost } from "./unknown-host";
import { versionMismatch } from "./version-mismatch";
import { worldDataCorrupt } from "./world-data-corrupt";
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
  serverWatchdog,
  asyncApiCall,
  versionMismatch,
  notWhitelisted,
  sessionLock,
  proxyForwarding,
  connectionThrottled,
  pluginEventError,
  modSetMismatch,
  packetDecodeError,
  clientLoginFailed,
  profileKeyError,
  flyingKick,
  unknownHost,
  diskFull,
  tooManyOpenFiles,
  sslCertificate,
  worldDataCorrupt,
  tickingCrash,
];
