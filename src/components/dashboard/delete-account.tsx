"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash } from "@phosphor-icons/react";
import { authClient } from "@/lib/auth-client";
import { ConfirmDialog } from "../confirm-dialog";

export const DELETE_PHRASE = "delete my account";

export function DeleteAccount({ logCount }: { logCount: number }) {
  const router = useRouter();
  const inputId = useId();
  const input = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const ready = typed.trim().toLowerCase() === DELETE_PHRASE;

  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  const logs =
    logCount === 0
      ? "You have no saved logs."
      : `${logCount.toLocaleString("en")} saved ${logCount === 1 ? "log" : "logs"} will be deleted too, and their links stop working.`;

  function close() {
    if (busy) return;
    setOpen(false);
    setTyped("");
    setProblem(null);
  }

  async function confirm() {
    if (!ready || busy) return;
    setBusy(true);
    setProblem(null);
    const { error } = await authClient.deleteUser({});
    if (error) {
      setBusy(false);
      setProblem(
        error.code === "SESSION_EXPIRED"
          ? "For your safety, log out and log back in, then try again."
          : "Couldn't delete the account. Try again in a moment.",
      );
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="dash-danger">
      <p className="dash-danger__text">
        Removes your profile, connected accounts, servers, webhooks and every session. {logs} It can&apos;t be
        undone.
      </p>
      <button
        type="button"
        className="button hollow button--danger"
        onClick={() => setOpen(true)}
      >
        <Trash size={18} aria-hidden="true" />
        Delete account
      </button>

      <ConfirmDialog
        open={open}
        busy={busy}
        problem={problem}
        title="Delete your account?"
        confirmLabel="Delete account"
        busyLabel="Deleting"
        confirmDisabled={!ready}
        onConfirm={() => void confirm()}
        onClose={close}
      >
        <p className="dash-confirm__text">
          {logs} Your profile, connected accounts, servers, webhooks and sessions go too. This can&apos;t be undone.
        </p>
        <label htmlFor={inputId} className="dash-confirm__label">
          Type <strong>{DELETE_PHRASE}</strong> to confirm
        </label>
        <input
          ref={input}
          id={inputId}
          className="dash-input"
          type="text"
          value={typed}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          onChange={(event) => setTyped(event.target.value)}
        />
      </ConfirmDialog>
    </div>
  );
}
