export type ThemeName = "light" | "dark";

export const THEME_KEY = "minelog:theme";

export function parseTheme(raw: string | null): ThemeName | null {
  return raw === "light" || raw === "dark" ? raw : null;
}

export function effectiveTheme(saved: ThemeName | null, systemDark: boolean): ThemeName {
  if (saved) return saved;
  return systemDark ? "dark" : "light";
}

function readSaved(): ThemeName | null {
  try {
    return parseTheme(window.localStorage.getItem(THEME_KEY));
  } catch {
    return null;
  }
}

function systemDark(): boolean {
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    return false;
  }
}

export function applyTheme(): void {
  setTheme(effectiveTheme(readSaved(), systemDark()));
}

export interface ThemeOrigin {
  x: number;
  y: number;
}

interface ViewTransition {
  finished: Promise<void>;
}

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => ViewTransition;
};

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

function writeTheme(next: ThemeName): void {
  const root = document.documentElement;
  root.dataset.theme = next;
  root.style.colorScheme = next;
}

function isHeavyPage(): boolean {
  try {
    if (document.querySelectorAll(".log__line").length > 400) return true;
    const height = document.documentElement.scrollHeight;
    const viewport = window.innerHeight || 800;
    if (height > viewport * 3) return true;
  } catch {
  }
  return false;
}

export function toggleTheme(origin?: ThemeOrigin): void {
  const next: ThemeName = effectiveTheme(readSaved(), systemDark()) === "dark" ? "light" : "dark";
  try {
    window.localStorage.setItem(THEME_KEY, next);
  } catch {
  }
  setTheme(next, origin);
}

function setTheme(next: ThemeName, origin?: ThemeOrigin): void {
  const root = document.documentElement;
  if (!origin || prefersReducedMotion() || isHeavyPage()) {
    writeTheme(next);
    return;
  }
  const doc = document as ViewTransitionDocument;
  if (typeof doc.startViewTransition !== "function") {
    writeTheme(next);
    return;
  }
  const x = Math.round(origin.x);
  const y = Math.round(origin.y);
  const radius = Math.ceil(
    Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)),
  );
  root.style.setProperty("--theme-x", `${x}px`);
  root.style.setProperty("--theme-y", `${y}px`);
  root.style.setProperty("--theme-r", `${radius}px`);
  try {
    doc.startViewTransition(() => writeTheme(next));
  } catch {
    writeTheme(next);
  }
}
