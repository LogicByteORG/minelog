"use client";

import { useEffect } from "react";
import { Moon, Sun } from "@phosphor-icons/react";
import type { MouseEvent } from "react";
import { applyTheme, toggleTheme } from "@/lib/theme";

export function ThemeToggle() {
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== "minelog:theme") return;
      applyTheme();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const onClick = (event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const hasPointer = event.clientX !== 0 || event.clientY !== 0;
    toggleTheme({
      x: hasPointer ? event.clientX : Math.round(rect.left + rect.width / 2),
      y: hasPointer ? event.clientY : Math.round(rect.top + rect.height / 2),
    });
  };

  return (
    <button
      type="button"
      className="nav-button nav-button--icon theme-toggle"
      data-tip="Toggle the color theme"
      aria-label="Toggle the color theme"
      onClick={onClick}
    >
      <Sun className="theme-toggle__icon theme-toggle__icon--sun" size={20} aria-hidden="true" />
      <Moon className="theme-toggle__icon theme-toggle__icon--moon" size={20} aria-hidden="true" />
    </button>
  );
}
