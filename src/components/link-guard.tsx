"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowSquareOut, ShieldWarning, X } from "@phosphor-icons/react";
import { useBackdropClose } from "@/lib/backdrop-close";

export const GUARD_ATTRIBUTE = "data-guard";

// Roughly three lines of the path at the dialog width. Longer paths are cut
// with an ellipsis until the visitor asks to see the whole address.
const LONG_PATH = 100;

type Target = { href: string; host: string; rest: string; disguised: boolean };

function describe(href: string): Target | null {
  try {
    const url = new URL(href);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    const rest = `${url.pathname}${url.search}${url.hash}`;
    return {
      href: url.href,
      host: url.host,
      rest: rest === "/" ? "" : rest,
      disguised: /(^|\.)xn--/i.test(url.hostname) || /^\d{1,3}(\.\d{1,3}){3}$/.test(url.hostname),
    };
  } catch {
    return null;
  }
}

function guardedLink(event: Event): HTMLAnchorElement | null {
  const node = event.target;
  if (!(node instanceof Element)) return null;
  const link = node.closest<HTMLAnchorElement>(`a[${GUARD_ATTRIBUTE}]`);
  return link && link.href ? link : null;
}

export function LinkGuard() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [target, setTarget] = useState<Target | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    function intercept(event: Event) {
      if (event instanceof MouseEvent && event.type === "auxclick" && event.button !== 1) return;
      const link = guardedLink(event);
      if (!link) return;
      const next = describe(link.href);
      if (!next) return;
      event.preventDefault();
      event.stopPropagation();
      setExpanded(false);
      setTarget(next);
    }
    document.addEventListener("click", intercept, true);
    document.addEventListener("auxclick", intercept, true);
    return () => {
      document.removeEventListener("click", intercept, true);
      document.removeEventListener("auxclick", intercept, true);
    };
  }, []);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (target && !element.open) {
      element.showModal();
    }
    if (!target && element.open) element.close();
  }, [target]);

  function close() {
    setTarget(null);
  }

  const backdrop = useBackdropClose(close);

  return (
    <dialog
      ref={dialog}
      className="dialog"
      aria-labelledby="leave-title"
      onClose={close}
      {...backdrop}
    >
      <div className="dialog__panel">
        <div className="dialog__head">
          <h2 id="leave-title" className="dialog__title">
            You are leaving Minelog
          </h2>
          <button
            type="button"
            className="dialog__close"
            aria-label="Close"
            data-tip="Close (Esc)"
            onClick={close}
          >
            <X aria-hidden="true" />
          </button>
        </div>

        <p className="dialog__text">
          Someone wrote this link in a shared log. Minelog has not checked it, so only continue if
          you trust where it goes.
        </p>

        {target && (
          <div className="leave">
            <p className="leave__host">
              <ShieldWarning aria-hidden="true" />
              <bdi>{target.host}</bdi>
            </p>
            {target.rest && (
              <p className="leave__rest" data-open={expanded}>
                {target.rest}
              </p>
            )}
            {target.rest.length > LONG_PATH && (
              <button
                type="button"
                className="leave__more"
                aria-expanded={expanded}
                onClick={() => setExpanded((value) => !value)}
              >
                {expanded ? "Show less" : "Show full address"}
              </button>
            )}
            {target.disguised && (
              <p className="leave__warn">
                This address is a raw IP or uses look-alike characters, which scam links often do.
              </p>
            )}
          </div>
        )}

        <div className="dialog__actions">
          {target && (
            <a
              className="button button--sm"
              href={target.href}
              target="_blank"
              rel="noopener noreferrer nofollow ugc"
              onClick={close}
            >
              <ArrowSquareOut aria-hidden="true" />
              Continue
            </a>
          )}
        </div>
      </div>
    </dialog>
  );
}
