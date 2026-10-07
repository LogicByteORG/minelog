"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

export type TextSize = "small" | "medium" | "large";
export type Spacing = "compact" | "comfortable";

export type ViewSettings = {
  wrap: boolean;
  lineNumbers: boolean;
  timestamps: boolean;
  colorLevels: boolean;
  foldStacks: boolean;
  textSize: TextSize;
  spacing: Spacing;
  panelOpen: boolean;
  fullWidth: boolean;
};

export const DEFAULT_SETTINGS: ViewSettings = {
  wrap: false,
  lineNumbers: true,
  timestamps: true,
  colorLevels: true,
  foldStacks: false,
  textSize: "medium",
  spacing: "comfortable",
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

