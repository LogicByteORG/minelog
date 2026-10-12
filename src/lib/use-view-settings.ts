"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

export type TextSize = "small" | "medium" | "large";
export type Spacing = "compact" | "comfortable";

export type LogFont =
  | "jetbrains"
  | "system-mono"
  | "menlo"
  | "consolas"
  | "cascadia-code"
  | "cascadia-mono"
  | "fira-code"
  | "fira-mono"
  | "source-code"
  | "plex-mono"
  | "roboto-mono"
  | "inconsolata"
  | "hack"
  | "dejavu"
  | "system-sans";

export type FontOption = {
  value: LogFont;
  label: string;
  stack: string;
};

export const FONT_OPTIONS: FontOption[] = [
  {
    value: "jetbrains",
    label: "JetBrains Mono",
    stack:
      "var(--font-jetbrains), ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  },
  {
    value: "system-mono",
    label: "System Mono",
    stack: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  },
  { value: "menlo", label: "Menlo", stack: "Menlo, Consolas, monospace" },
  { value: "consolas", label: "Consolas", stack: "Consolas, Menlo, monospace" },
  {
    value: "cascadia-code",
    label: "Cascadia Code",
    stack: '"Cascadia Code", Consolas, Menlo, monospace',
  },
  {
    value: "cascadia-mono",
    label: "Cascadia Mono",
    stack: '"Cascadia Mono", Consolas, Menlo, monospace',
  },
  {
    value: "fira-code",
    label: "Fira Code",
    stack: '"Fira Code", Consolas, Menlo, monospace',
  },
  {
    value: "fira-mono",
    label: "Fira Mono",
    stack: '"Fira Mono", Consolas, Menlo, monospace',
  },
  {
    value: "source-code",
    label: "Source Code Pro",
    stack: '"Source Code Pro", Consolas, Menlo, monospace',
  },
  {
    value: "plex-mono",
    label: "IBM Plex Mono",
    stack: '"IBM Plex Mono", Consolas, Menlo, monospace',
  },
  {
    value: "roboto-mono",
    label: "Roboto Mono",
    stack: '"Roboto Mono", Consolas, Menlo, monospace',
  },
  {
    value: "inconsolata",
    label: "Inconsolata",
    stack: "Inconsolata, Consolas, Menlo, monospace",
  },
  { value: "hack", label: "Hack", stack: "Hack, Consolas, Menlo, monospace" },
  {
    value: "dejavu",
    label: "DejaVu Sans Mono",
    stack: '"DejaVu Sans Mono", Consolas, Menlo, monospace',
  },
  {
    value: "system-sans",
    label: "System Sans",
    stack: "ui-sans-serif, system-ui, sans-serif",
  },
];

export function fontStackOf(font: LogFont): string {
  return FONT_OPTIONS.find((option) => option.value === font)?.stack ?? FONT_OPTIONS[0].stack;
}

export type ViewSettings = {
  wrap: boolean;
  lineNumbers: boolean;
  timestamps: boolean;
  colorLevels: boolean;
  foldStacks: boolean;
  hideChat: boolean;
  hideEmpty: boolean;
  markedOnly: boolean;
  linkify: boolean;
  textSize: TextSize;
  spacing: Spacing;
  fontFamily: LogFont;
  panelOpen: boolean;
  fullWidth: boolean;
};

export const DEFAULT_SETTINGS: ViewSettings = {
  wrap: false,
  lineNumbers: true,
  timestamps: true,
  colorLevels: true,
  foldStacks: false,
  hideChat: false,
  hideEmpty: false,
  markedOnly: false,
  linkify: false,
  textSize: "medium",
  spacing: "comfortable",
  fontFamily: "jetbrains",
  panelOpen: true,
  fullWidth: false,
};

const KEY = "minelog:view-settings:v1";
const listeners = new Set<() => void>();

let memory = "";

function readRaw(): string {
  try {
    return window.localStorage.getItem(KEY) ?? memory;
  } catch {
    return memory;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function parseViewSettings(raw: string): ViewSettings {
  let saved: Partial<Record<keyof ViewSettings, unknown>> = {};
  try {
    const value: unknown = raw ? JSON.parse(raw) : {};
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      saved = value as Partial<Record<keyof ViewSettings, unknown>>;
    }
  } catch {
    saved = {};
  }
  const flag = (key: keyof ViewSettings) =>
    typeof saved[key] === "boolean"
      ? (saved[key] as boolean)
      : (DEFAULT_SETTINGS[key] as boolean);

  return {
    wrap: flag("wrap"),
    lineNumbers: flag("lineNumbers"),
    timestamps: flag("timestamps"),
    colorLevels: flag("colorLevels"),
    foldStacks: flag("foldStacks"),
    hideChat: flag("hideChat"),
    hideEmpty: flag("hideEmpty"),
    markedOnly: flag("markedOnly"),
    linkify: flag("linkify"),
    panelOpen: flag("panelOpen"),
    fullWidth: flag("fullWidth"),
    textSize: (["small", "medium", "large"] as const).includes(
      saved.textSize as TextSize,
    )
      ? (saved.textSize as TextSize)
      : DEFAULT_SETTINGS.textSize,
    spacing: (["compact", "comfortable"] as const).includes(
      saved.spacing as Spacing,
    )
      ? (saved.spacing as Spacing)
      : DEFAULT_SETTINGS.spacing,
    fontFamily: (FONT_OPTIONS.map((option) => option.value) as string[]).includes(
      saved.fontFamily as string,
    )
      ? (saved.fontFamily as LogFont)
      : DEFAULT_SETTINGS.fontFamily,
  };
}

export function useViewSettings() {
  const raw = useSyncExternalStore(subscribe, readRaw, () => "");
  const settings = useMemo(() => parseViewSettings(raw), [raw]);

  const update = useCallback((patch: Partial<ViewSettings>) => {
    const next = JSON.stringify({ ...parseViewSettings(readRaw()), ...patch });
    memory = next;
    try {
      window.localStorage.setItem(KEY, next);
    } catch {
    }
    listeners.forEach((listener) => listener());
  }, []);

  const reset = useCallback(() => {
    memory = "";
    try {
      window.localStorage.removeItem(KEY);
    } catch {
    }
    listeners.forEach((listener) => listener());
  }, []);

  return { settings, update, reset };
}

