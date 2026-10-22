"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { BookOpen, Code, DotsThree, PuzzlePiece, X } from "@phosphor-icons/react";
import { useBackdropClose } from "@/lib/backdrop-close";
import { DASHBOARD_RESOURCES } from "./nav-items";

const ICONS = {
  "/guides": BookOpen,
  "/plugin": PuzzlePiece,
  "/api": Code,
} as const;

export function DashboardMenu() {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const backdrop = useBackdropClose(() => setOpen(false));

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="nav-button nav-button--icon"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Open resources"
        data-tip="Guides, plugin and API"
        onClick={() => setOpen(true)}
      >
        <DotsThree size={22} weight="bold" aria-hidden="true" />
      </button>
      <dialog
        ref={dialog}
        className="dash-drawer"
        aria-labelledby={titleId}
        onClose={() => setOpen(false)}
        {...backdrop}
      >
        <div className="dash-drawer__panel">
          <div className="dialog__head">
            <h2 id={titleId} className="dialog__title">
              Resources
            </h2>
            <button
              type="button"
              className="dialog__close"
              aria-label="Close"
              data-tip="Close (Esc)"
              onClick={() => setOpen(false)}
            >
              <X aria-hidden="true" />
            </button>
          </div>
          <nav aria-label="Resources" className="dash-drawer__links">
            {DASHBOARD_RESOURCES.map((resource) => {
              const Icon = ICONS[resource.href];
              return (
                <Link
                  key={resource.href}
                  href={resource.href}
                  className="site-menu__link"
                  onClick={() => setOpen(false)}
                >
                  <Icon size={20} aria-hidden="true" />
                  {resource.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </dialog>
    </>
  );
}
