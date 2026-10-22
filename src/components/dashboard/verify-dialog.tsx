"use client";

import { useState } from "react";
import { ShieldCheck } from "@phosphor-icons/react";
import { authClient } from "@/lib/auth-client";
import { ACCOUNT_PATH, type AuthProvider } from "@/lib/auth-providers";
import { ConfirmDialog } from "../confirm-dialog";

export function VerifyDialog({
  open,
  provider,
  onClose,
}: {
  open: boolean;
  provider: AuthProvider;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  async function confirm() {
    if (busy) return;
    setBusy(true);
    setProblem(null);
    const { error } = await authClient.signIn.social({
      provider: provider.id,
      callbackURL: `${ACCOUNT_PATH}?verified=1`,
      errorCallbackURL: `${ACCOUNT_PATH}?verify=failed`,
    });
    if (error) {
      setProblem(`Couldn't reach ${provider.label}. Try again in a moment.`);
      setBusy(false);
    }
  }

  function close() {
    if (busy) return;
    setProblem(null);
    onClose();
  }

  return (
    <ConfirmDialog
      open={open}
      busy={busy}
      problem={problem}
      title="Confirm it's you"
      confirmLabel={`Continue with ${provider.label}`}
      busyLabel={`Opening ${provider.label}`}
      icon={<ShieldCheck aria-hidden="true" />}
      tone="default"
      onConfirm={() => void confirm()}
      onClose={close}
    >
      This change affects how you sign in or what is kept, so sign in with {provider.label} again
      first. It&apos;s your primary account. You come straight back here afterwards.
    </ConfirmDialog>
  );
}
