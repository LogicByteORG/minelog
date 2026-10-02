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
  const next = effectiveTheme(readSaved(), systemDark());
  const root = document.documentElement;
  root.dataset.theme = next;
  root.style.colorScheme = next;
}

export function toggleTheme(): void {
  const next: ThemeName = effectiveTheme(readSaved(), systemDark()) === "dark" ? "light" : "dark";
  try {
    window.localStorage.setItem(THEME_KEY, next);
  } catch {
  }
  const root = document.documentElement;
  root.dataset.theme = next;
  root.style.colorScheme = next;
}
