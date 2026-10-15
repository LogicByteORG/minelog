"use client";

import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import { CaretDown, Package } from "@phosphor-icons/react";
import { CURSEFORGE_URL, HANGAR_URL } from "@/lib/config";
import { useFloatingMenu } from "@/lib/use-floating-menu";
import { BrandIcon } from "./brand-icon";

export function DownloadMenu() {
  const { open, pos, button, menu, toggle, close } = useFloatingMenu<HTMLDivElement>();

  return (
    <div className="download-menu">
      <button
        type="button"
        ref={button}
        className="nav-button download-menu__button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="download-menu-panel"
        data-tip="Get the server plugin"
        onClick={toggle}
      >
        Download
        <CaretDown size={14} aria-hidden="true" className="download-menu__caret" />
      </button>
      {open &&
        createPortal(
          <div
            role="menu"
            aria-label="Download options"
            id="download-menu-panel"
            ref={menu}
            className="download-menu__panel"
            style={{ top: pos.top, "--download-right": `${pos.right}px` } as CSSProperties}
          >
            <a
              href={HANGAR_URL}
              role="menuitem"
              className="download-menu__link"
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
            >
              <Package size={18} aria-hidden="true" />
              Paper Hangar
            </a>
            <span
              role="menuitem"
              aria-disabled="true"
              className="download-menu__link download-menu__link--soon"
              data-tip="Coming soon"
            >
              <BrandIcon slug="modrinth" size={18} />
              Modrinth
              <span className="download-menu__soon">Soon</span>
            </span>
            <a
              href={CURSEFORGE_URL}
              role="menuitem"
              className="download-menu__link"
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
            >
              <BrandIcon slug="curseforge" size={18} />
              CurseForge
            </a>
          </div>,
          document.body,
        )}
    </div>
  );
}
