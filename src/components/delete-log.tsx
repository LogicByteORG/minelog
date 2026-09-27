"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Trash, X } from "@phosphor-icons/react";
import { deleteLog } from "@/lib/api";
import {
  forgetDeleteToken,
  parseDeleteEntry,
  readDeleteRaw,
  subscribeDeleteTokens,
} from "@/lib/delete-token";

const TICK_MS = 15_000;

function subscribeTick(notify: () => void) {
  const timer = window.setInterval(notify, TICK_MS);
  return () => window.clearInterval(timer);
}

export function DeleteLog({ logId }: { logId: string }) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);

  const raw = useSyncExternalStore(
    subscribeDeleteTokens,
    () => readDeleteRaw(logId),
    () => null,
  );
  const entry = useMemo(() => parseDeleteEntry(raw), [raw]);
  const tick = useSyncExternalStore(
    subscribeTick,
    () => Math.floor(Date.now() / TICK_MS),
    () => 0,
  );

  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open, entry]);

  if (!entry) return null;
  const minutes = Math.ceil((entry.until - tick * TICK_MS) / 60_000);
  if (minutes <= 0) return null;

  function close() {
    if (busy) return;
    setOpen(false);
    setProblem(null);
  }

  async function confirm() {
    if (!entry || busy) return;
    setBusy(true);
    setProblem(null);
    try {
      await deleteLog(logId, entry.token);
      forgetDeleteToken(logId);
      router.replace("/");
    } catch (error) {
      setBusy(false);
      setProblem(
        error instanceof Error
          ? error.message
          : "Couldn't delete the log. Try again in a moment.",
      );
    }
  }

  return (
    <section className="delete-log" aria-labelledby="delete-log-title">
      <div className="delete-log__text">
        <h2 id="delete-log-title" className="delete-log__title">
          Saved this by mistake?
        </h2>
        <p>
          You can delete this log for another {minutes}{" "}
          {minutes === 1 ? "minute" : "minutes"}. After that it stays until it
          expires.
        </p>
      </div>
      <button
        type="button"
        className="button hollow button--sm button--danger"
        onClick={() => setOpen(true)}
      >
        <Trash aria-hidden="true" />
        Delete this log
      </button>

      <dialog
        ref={dialog}
        className="dialog"
        aria-labelledby="delete-dialog-title"
        onCancel={(event) => {
          if (busy) event.preventDefault();
        }}
        onClose={() => {
          setOpen(false);
          setProblem(null);
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        <div className="dialog__panel">
          <div className="dialog__head">
            <h2 id="delete-dialog-title" className="dialog__title">
              Delete this log?
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
            It stops working for everyone right away, including anyone you sent
            the link to. This can&apos;t be undone.
          </p>

          <div className="dialog__actions">
            <button
              type="button"
              className="button button--sm button--danger"
              onClick={() => void confirm()}
              aria-busy={busy}
            >
              {busy ? (
                <span className="loader" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </span>
              ) : (
                <Trash aria-hidden="true" />
              )}
              {busy ? "Deleting" : "Delete log"}
            </button>
          </div>

          {problem && (
            <p className="dialog__problem" role="alert">
              {problem}
            </p>
          )}
        </div>
      </dialog>
    </section>
  );
}

