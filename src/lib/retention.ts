import {
  IS_PREVIEW,
  PREVIEW_RETENTION_HOURS,
  RETENTION_DAYS,
  UNHIDDEN_RETENTION_HOURS,
} from "./config";

export function retentionHours(
  hidePrivate: boolean,
  preview: boolean = IS_PREVIEW,
): number {
  if (preview) return PREVIEW_RETENTION_HOURS;
  return hidePrivate ? RETENTION_DAYS * 24 : UNHIDDEN_RETENTION_HOURS;
}

export function timeLeft(expires: Date, now: Date = new Date()): string {
  const hours = Math.ceil((expires.getTime() - now.getTime()) / 3_600_000);
  if (hours <= 1) return "within an hour";
  if (hours <= 48) return `in ${hours} hours`;
  return `in ${Math.ceil(hours / 24)} days`;
}
