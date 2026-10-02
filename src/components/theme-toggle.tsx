"use client";

import { useEffect } from "react";
import { Moon, Sun } from "@phosphor-icons/react";
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

  return (
    <button
      type="button"
      className="nav-button nav-button--icon theme-toggle"
      data-tip="Toggle the color theme"
      aria-label="Toggle the color theme"
      onClick={toggleTheme}
    >
      <Sun className="theme-toggle__icon theme-toggle__icon--sun" size={20} aria-hidden="true" />
      <Moon className="theme-toggle__icon theme-toggle__icon--moon" size={20} aria-hidden="true" />
    </button>
  );
}
