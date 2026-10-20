"use client";

import { useEffect, useId, useRef, type FormEvent, type ReactNode } from "react";
import { X } from "@phosphor-icons/react";
import { useBackdropClose } from "@/lib/backdrop-close";

export function Modal({
  open,
  busy = false,
  title,
  wide = false,
  onClose,
  onSubmit,
  children,
}: {
  open: boolean;
  busy?: boolean;
  title: string;
  wide?: boolean;
  onClose: () => void;
  onSubmit?: () => void;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) {
      element.showModal();
      element.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    }
    if (!open && element.open) element.close();
  }, [open]);

  const backdrop = useBackdropClose(() => {
    if (!busy) onClose();
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!busy) onSubmit?.();
  }

  return (
    <dialog
      ref={dialog}
      className={wide ? "dialog dialog--wide" : "dialog"}
      aria-labelledby={titleId}
      onCancel={(event) => {
        if (busy) event.preventDefault();
      }}
      onClose={onClose}
      {...backdrop}
    >
      <form className="dialog__panel" noValidate onSubmit={submit}>
        <div className="dialog__head">
          <h2 id={titleId} className="dialog__title">
            {title}
          </h2>
          <button
            type="button"
            className="dialog__close"
            aria-label="Close"
            data-tip="Close (Esc)"
            onClick={() => {
              if (!busy) onClose();
            }}
          >
            <X aria-hidden="true" />
          </button>
        </div>
        {children}
      </form>
    </dialog>
  );
}
