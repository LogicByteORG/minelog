export const SAVE_COUNT_KEY = "minelog:saves";
export const DONATE_DISMISSED_KEY = "minelog:donate-nudge";
export const DONATE_AFTER_SAVES = 3;

export function readSaveCount(): number {
  try {
    const saved = Number(window.localStorage.getItem(SAVE_COUNT_KEY));
    return Number.isInteger(saved) && saved > 0 ? saved : 0;
  } catch {
    return 0;
  }
}

export function recordSave(): number {
  const next = readSaveCount() + 1;
  try {
    window.localStorage.setItem(SAVE_COUNT_KEY, String(next));
  } catch {
  }
  return next;
}

export function donateDismissed(): boolean {
  try {
    return window.localStorage.getItem(DONATE_DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

export function dismissDonateNudge(): void {
  try {
    window.localStorage.setItem(DONATE_DISMISSED_KEY, "1");
  } catch {
  }
}

export function shouldShowDonateNudge(saveCount: number, dismissed: boolean): boolean {
  return !dismissed && saveCount >= DONATE_AFTER_SAVES;
}
