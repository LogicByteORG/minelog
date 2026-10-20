"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { removeAlert } from "@/app/dash/alerts/actions";
import { Trash } from "@phosphor-icons/react";
import { ConfirmDialog } from "../confirm-dialog";

export function DeleteAlert({ id }: { id: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  async function confirm() {
    if (busy) return;
    setBusy(true);
    setProblem(null);
    const outcome = await removeAlert(id);
    if (!outcome.ok) {
      setBusy(false);
      setProblem(outcome.error);
      return;
    }
    router.replace("/dash/alerts");
  }

  return (
    <>
      <button type="button" className="button hollow button--danger" onClick={() => setOpen(true)}>
        <Trash size={18} aria-hidden="true" />
        Delete alert
      </button>
      <ConfirmDialog
        open={open}
        busy={busy}
        problem={problem}
        title="Delete this alert?"
        confirmLabel="Delete alert"
        busyLabel="Deleting"
        onConfirm={() => void confirm()}
        onClose={() => {
          if (busy) return;
          setOpen(false);
          setProblem(null);
        }}
      >
        The saved log lines are removed right away. If the same error shows up again, it starts a
        new alert.
      </ConfirmDialog>
    </>
  );
}
