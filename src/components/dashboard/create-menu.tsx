"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import { CaretDown, Plus, SquaresFour } from "@phosphor-icons/react";
import { useFloatingMenu } from "@/lib/use-floating-menu";

export function CreateMenu() {
  const { open, pos, button, menu, toggle, close } = useFloatingMenu<HTMLDivElement>();

  return (
    <>
      <button
        type="button"
        ref={button}
        className="nav-button dash-create"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="create-menu-panel"
        onClick={toggle}
      >
        <Plus size={16} weight="bold" aria-hidden="true" />
        Create
        <CaretDown size={12} weight="bold" aria-hidden="true" />
      </button>
      {open &&
        createPortal(
          <div
            role="menu"
            aria-label="Create"
            id="create-menu-panel"
            ref={menu}
            className="site-menu__panel account__panel"
            style={{ top: pos.top, "--menu-right": `${pos.right}px` } as CSSProperties}
          >
            <Link href="/dash/pages" role="menuitem" className="site-menu__link" onClick={close}>
              <SquaresFour size={18} aria-hidden="true" />
              Custom log page
            </Link>
          </div>,
          document.body,
        )}
    </>
  );
}
