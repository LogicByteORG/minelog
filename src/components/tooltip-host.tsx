"use client";

import { useEffect, useRef } from "react";

const SHOW_DELAY = 280;
const WARM_WINDOW = 450;
const OFFSET_X = 14;
const OFFSET_Y = 22;
const EDGE = 8;

export function TooltipHost() {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = box.current;
    if (!node) return;

    let target: HTMLElement | null = null;
    let timer: number | undefined;
    let lastHidden = 0;
    let open = false;
    const pointer = { x: 0, y: 0 };

    const tipOf = (source: EventTarget | null): HTMLElement | null =>
      source instanceof Element
        ? source.closest<HTMLElement>("[data-tip]")
        : null;

    function place(x: number, y: number) {
      if (!node) return;
      const width = node.offsetWidth;
      const height = node.offsetHeight;

      let left = x + OFFSET_X;
      let top = y + OFFSET_Y;
      if (left + width + EDGE > window.innerWidth) left = x - OFFSET_X - width;
      if (top + height + EDGE > window.innerHeight) top = y - 12 - height;

      left = Math.max(EDGE, left);
      top = Math.max(EDGE, top);
      node.style.transform = `translate3d(${Math.round(left)}px, ${Math.round(top)}px, 0)`;
    }

    function show(element: HTMLElement, x: number, y: number) {
      const text = element.dataset.tip;
      if (!node || !text) return;

      target = element;
      node.textContent = text;
      if (!open && typeof node.showPopover === "function") {
        try {
          node.showPopover();
        } catch {
        }
      }
      node.dataset.open = "true";
      open = true;
      place(x, y);
    }

    function hide() {
      window.clearTimeout(timer);
      target = null;
      if (!open || !node) return;
      open = false;
      lastHidden = performance.now();
      delete node.dataset.open;
      if (typeof node.hidePopover === "function") {
        try {
          node.hidePopover();
        } catch {
        }
      }
    }

    function onPointerOver(event: PointerEvent) {
      if (event.pointerType === "touch") return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;

      const next = tipOf(event.target);
      if (next === target) return;

      hide();
      if (!next) return;

      target = next;
      const warm = performance.now() - lastHidden < WARM_WINDOW;
      timer = window.setTimeout(
        () => show(next, pointer.x, pointer.y),
        warm ? 0 : SHOW_DELAY,
      );
    }

    function onPointerMove(event: PointerEvent) {
      if (event.pointerType === "touch") return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      if (!open || !target) return;

      if (
        !target.isConnected ||
        (target instanceof HTMLButtonElement && target.disabled)
      ) {
        hide();
        return;
      }

      const text = target.dataset.tip;
      if (!text) {
        hide();
        return;
      }
      if (node && node.textContent !== text) node.textContent = text;
      place(pointer.x, pointer.y);
    }

    function onPointerOut(event: PointerEvent) {
      if (!event.relatedTarget) hide();
    }

    function onFocusIn(event: FocusEvent) {
      const element = tipOf(event.target);
      if (!element || !element.matches(":focus-visible")) return;
      hide();
      const rect = element.getBoundingClientRect();
      show(element, rect.left + rect.width / 2 - OFFSET_X, rect.bottom - OFFSET_Y + 8);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") hide();
    }

    const passive = { passive: true } as const;
    document.addEventListener("pointerover", onPointerOver, passive);
    document.addEventListener("pointermove", onPointerMove, passive);
    document.addEventListener("pointerout", onPointerOut, passive);
    document.addEventListener("pointerdown", hide, passive);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", hide);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", hide, { passive: true, capture: true });
    window.addEventListener("blur", hide);

    return () => {
      hide();
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerout", onPointerOut);
      document.removeEventListener("pointerdown", hide);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", hide);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", hide, { capture: true });
      window.removeEventListener("blur", hide);
    };
  }, []);

  return (
    <div
      ref={box}
      className="tooltip"
      popover="manual"
      aria-hidden="true"
    />
  );
}

