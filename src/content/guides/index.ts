// Each guide lives in its own file so that editing one can't risk breaking
// or merge-conflicting with the others. This file only aggregates them.
import { CANT_KEEP_UP } from "./minecraft-server-cant-keep-up";
import { CRASH_REPORT } from "./minecraft-crash-report";
import { FAILED_TO_BIND } from "./minecraft-failed-to-bind-to-port";
import { FIND_LOGS } from "./find-minecraft-logs";
import { JAVA_VERSION } from "./minecraft-java-version-error";
import { MINELOG_AND_MCLOGS } from "./minelog-and-mclogs";
import { MINELOG_AND_MINESTRATOR } from "./minelog-and-mclogs-minestrator";
import { MINELOG_AND_PASTEBIN } from "./minelog-and-pastebin";
import { OUT_OF_MEMORY } from "./minecraft-out-of-memory-error";
import { SHARE_SAFELY } from "./share-a-log-file-safely";
import type { Guide } from "./types";

export type { Block, Faq, Guide, Section } from "./types";

export {
  CANT_KEEP_UP,
  CRASH_REPORT,
  FAILED_TO_BIND,
  FIND_LOGS,
  JAVA_VERSION,
  MINELOG_AND_MCLOGS,
  MINELOG_AND_MINESTRATOR,
  MINELOG_AND_PASTEBIN,
  OUT_OF_MEMORY,
  SHARE_SAFELY,
};

export const GUIDES: Guide[] = [
  FIND_LOGS,
  CRASH_REPORT,
  SHARE_SAFELY,
  OUT_OF_MEMORY,
  JAVA_VERSION,
  CANT_KEEP_UP,
  FAILED_TO_BIND,
  MINELOG_AND_MCLOGS,
  MINELOG_AND_MINESTRATOR,
  MINELOG_AND_PASTEBIN,
];

export function guideBySlug(slug: string): Guide | undefined {
  return GUIDES.find((guide) => guide.slug === slug);
}
