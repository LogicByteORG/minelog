"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useFloatingMenu<M extends HTMLElement>() {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const button = useRef<HTMLButtonElement>(null);
  const menu = useRef<M>(null);

  const close = useCallback(() => setOpen(false), []);

  const toggle = useCallback(() => {
    setOpen((current) => {
      if (current) return false;
      const rect = button.current?.getBoundingClientRect();
      if (rect) {
        setPos({
          top: rect.bottom + 8,
          right: Math.max(8, window.innerWidth - rect.right),
        });
      }
      return true;
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!button.current?.contains(target) && !menu.current?.contains(target)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    const onScroll = () => setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [open]);

  return { open, pos, button, menu, toggle, close };
}

