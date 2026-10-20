"use client";

import type { ReactNode } from "react";
import { Trash } from "@phosphor-icons/react";
import { Loader } from "./loader";
import { Modal } from "./modal";

export function ConfirmDialog({
  open,
  busy,
  problem,
  title,
  confirmLabel,
  busyLabel,
  icon,
  confirmDisabled = false,
  onConfirm,
  onClose,
  children,
}: {
  open: boolean;
  busy: boolean;
  problem: string | null;
  title: string;
  confirmLabel: string;
  busyLabel: string;
  icon?: ReactNode;
  confirmDisabled?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Modal
      open={open}
      busy={busy}
      title={title}
      onClose={onClose}
      onSubmit={() => {
        if (!confirmDisabled) onConfirm();
      }}
    >
      <div className="dialog__text">{children}</div>

      <div className="dialog__actions">
        <button
          type="submit"
          className="button button--sm button--danger"
          disabled={confirmDisabled}
          aria-busy={busy}
        >
          {busy ? <Loader /> : (icon ?? <Trash aria-hidden="true" />)}
          {busy ? busyLabel : confirmLabel}
        </button>
      </div>

      {problem && (
        <p className="dialog__problem" role="alert">
          {problem}
        </p>
      )}
    </Modal>
  );
}
