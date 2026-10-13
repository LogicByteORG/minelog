"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import { List, X } from "@phosphor-icons/react";
import { GITHUB_URL, MODRINTH_URL } from "@/lib/config";
import { useFloatingMenu } from "@/lib/use-floating-menu";
import { BrandIcon } from "./brand-icon";

export function HeaderMenu() {
  const { open, pos, button, menu, toggle, close } = useFloatingMenu<HTMLDivElement>();

  return (
    <div className="site-menu">
      <button
        type="button"
        ref={button}
        className="nav-button nav-button--icon"
        aria-expanded={open}
        aria-controls="site-menu-panel"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={toggle}
      >
        {open ? (
          <X size={20} aria-hidden="true" />
        ) : (
          <List size={20} aria-hidden="true" />
        )}
      </button>
      {open &&
        createPortal(
          <div
            role="dialog"
            aria-label="Menu"
            id="site-menu-panel"
            ref={menu}
            className="site-menu__panel"
            style={{ top: pos.top, "--menu-right": `${pos.right}px` } as CSSProperties}
          >
            <Link href="/" className="site-menu__link" onClick={close}>
              Share a log
            </Link>
            <Link href="/guides" className="site-menu__link" onClick={close}>
              Guides
            </Link>
            <Link href="/api" className="site-menu__link" onClick={close}>
              API
            </Link>
            <a
              href={MODRINTH_URL}
              className="site-menu__link"
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
            >
              <BrandIcon slug="modrinth" size={18} />
              Download plugin
            </a>
            <a
              href={GITHUB_URL}
              className="site-menu__link"
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
            >
              <BrandIcon slug="github" size={20} />
              Source on GitHub
            </a>
          </div>,
          document.body,
        )}
    </div>
  );
}
