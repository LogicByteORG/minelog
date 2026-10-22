"use client";

import { useState } from "react";
import { LinkBreak } from "@phosphor-icons/react";
import { disconnectAccount } from "@/app/dash/actions";
import { authClient } from "@/lib/auth-client";
import {
  ACCOUNT_PATH,
  AUTH_PROVIDERS,
  type AuthProviderId,
} from "@/lib/auth-providers";
import type { LinkedAccount } from "@/lib/dashboard";
import { formatDate } from "@/lib/time";
import { BrandIcon } from "../brand-icon";
import { ConfirmDialog } from "../confirm-dialog";
import { Loader } from "../loader";

export function ConnectedAccounts({ linked }: { linked: LinkedAccount[] }) {
  const [connecting, setConnecting] = useState<AuthProviderId | null>(null);
  const [pending, setPending] = useState<AuthProviderId | null>(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const canDisconnect = linked.length > 1;
  const pendingLabel = AUTH_PROVIDERS.find((provider) => provider.id === pending)?.label;

  async function connect(provider: AuthProviderId) {
    setConnecting(provider);
    setProblem(null);
    const { error } = await authClient.linkSocial({
      provider,
      callbackURL: ACCOUNT_PATH,
      errorCallbackURL: ACCOUNT_PATH,
    });
    if (error) {
      setProblem("That account couldn't be connected. Give it another try in a moment.");
      setConnecting(null);
    }
  }

  function close() {
    if (busy) return;
    setPending(null);
    setProblem(null);
  }

  async function confirm() {
    if (!pending || busy) return;
    setBusy(true);
    setProblem(null);
    const outcome = await disconnectAccount(pending);
    setBusy(false);
    if (!outcome.ok) {
      setProblem(outcome.error);
      return;
    }
    setPending(null);
  }

  return (
    <>
      <ul className="dash-accounts">
        {AUTH_PROVIDERS.map((provider) => {
          const account = linked.find((item) => item.provider.id === provider.id);
          return (
            <li key={provider.id} className="dash-accounts__row">
              <span className="dash-accounts__who">
                <BrandIcon slug={provider.brand} size={20} />
                <span className="dash-accounts__name">{provider.label}</span>
              </span>
              <span className="dash-accounts__state">
                {account ? `Connected ${formatDate(account.connectedAt)}` : "Not connected"}
              </span>
              {account ? (
                <span
                  className="dash-accounts__action"
                  data-tip={canDisconnect ? undefined : "Connect another account first"}
                >
                  <button
                    type="button"
                    className="button hollow button--danger"
                    disabled={!canDisconnect}
                    onClick={() => setPending(provider.id)}
                  >
                    Disconnect
                  </button>
                </span>
              ) : (
                <span className="dash-accounts__action">
                  <button
                    type="button"
                    className="button hollow"
                    disabled={connecting !== null}
                    aria-busy={connecting === provider.id}
                    onClick={() => void connect(provider.id)}
                  >
                    {connecting === provider.id && <Loader />}
                    Connect
                  </button>
                </span>
              )}
            </li>
          );
        })}
      </ul>

      {problem && pending === null && (
        <p className="dash-accounts__problem" role="alert">
          {problem}
        </p>
      )}

      <ConfirmDialog
        open={pending !== null}
        busy={busy}
        problem={problem}
        title={`Disconnect ${pendingLabel ?? "account"}?`}
        confirmLabel="Disconnect"
        busyLabel="Disconnecting"
        icon={<LinkBreak aria-hidden="true" />}
        onConfirm={() => void confirm()}
        onClose={close}
      >
        You won&apos;t be able to log in with {pendingLabel ?? "it"} anymore. Your logs stay yours
        and you can connect it again later.
      </ConfirmDialog>
    </>
  );
}
