"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Trash } from "@phosphor-icons/react";
import { deleteOwnedLog, ownsLog } from "@/app/dash/actions";
import { deleteLog } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { DASHBOARD_PATH } from "@/lib/auth-providers";
import {
  forgetDeleteToken,
  parseDeleteEntry,
  readDeleteRaw,
  subscribeDeleteTokens,
} from "@/lib/delete-token";
import { ConfirmDialog } from "./confirm-dialog";

const TICK_MS = 15_000;

function subscribeTick(notify: () => void) {
  const timer = window.setInterval(notify, TICK_MS);
  return () => window.clearInterval(timer);
}

function useOwnsLog(logId: string): boolean {
  const { data } = authClient.useSession();
  const userId = data?.user.id ?? null;
  const [owned, setOwned] = useState<{ logId: string; userId: string } | null>(null);

  useEffect(() => {
    if (!userId) return;
    let live = true;
    void ownsLog(logId).then((result) => {
      if (live) setOwned(result ? { logId, userId } : null);
    });
    return () => {
      live = false;
    };
  }, [logId, userId]);

  return owned !== null && owned.logId === logId && owned.userId === userId;
}

export function DeleteLog({ logId }: { logId: string }) {
  const router = useRouter();
  const owned = useOwnsLog(logId);

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

  const minutes = entry ? Math.ceil((entry.until - tick * TICK_MS) / 60_000) : 0;
  if (!owned && (!entry || minutes <= 0)) return null;

  function close() {
    if (busy) return;
    setOpen(false);
    setProblem(null);
  }

  async function confirm() {
    if (busy) return;
    setBusy(true);
    setProblem(null);
    try {
      if (owned) {
        const outcome = await deleteOwnedLog(logId);
        if (!outcome.ok) throw new Error(outcome.error);
        router.replace(`${DASHBOARD_PATH}/logs`);
        return;
      }
      if (!entry) return;
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
          {owned ? "This log is yours" : "Saved this by mistake?"}
        </h2>
        <p>
          {owned
            ? "It's saved to your account, so you can delete it whenever you like. If you don't, it stays until it expires."
            : `You can delete this log for another ${minutes} ${minutes === 1 ? "minute" : "minutes"}. After that it stays until it expires.`}
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

      <ConfirmDialog
        open={open}
        busy={busy}
        problem={problem}
        title="Delete this log?"
        confirmLabel="Delete log"
        busyLabel="Deleting"
        onConfirm={() => void confirm()}
        onClose={close}
      >
        It stops working for everyone right away, including anyone you sent the
        link to. This can&apos;t be undone.
      </ConfirmDialog>
    </section>
  );
}
