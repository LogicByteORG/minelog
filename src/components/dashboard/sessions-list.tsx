"use client";

import { useState } from "react";
import { DeviceMobile, DeviceTablet, Desktop } from "@phosphor-icons/react";
import { signOutDevice, signOutOtherDevices } from "@/app/dash/account/actions";
import type { ActionOutcome } from "@/app/dash/actions";
import type { SessionView } from "@/lib/sessions";
import type { DeviceKind } from "@/lib/user-agent";
import { Loader } from "../loader";

const ALL = "all";

const ICONS: Record<DeviceKind, typeof Desktop> = {
  phone: DeviceMobile,
  tablet: DeviceTablet,
  desktop: Desktop,
};

export function SessionsList({ sessions }: { sessions: SessionView[] }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

  const others = sessions.filter((session) => !session.current).length;

  async function run(key: string, action: () => Promise<ActionOutcome>) {
    if (busy) return;
    setBusy(key);
    setProblem(null);
    const outcome = await action();
    setBusy(null);
    if (!outcome.ok) setProblem(outcome.error);
  }

  return (
    <>
      <ul className="dash-accounts dash-accounts--wide">
        {sessions.map((session) => {
          const Icon = ICONS[session.kind];
          return (
            <li key={session.id} className="dash-accounts__row">
              <span className="dash-accounts__who">
                <Icon size={20} aria-hidden="true" />
                <span className="dash-accounts__name">{session.device}</span>
              </span>
              <span className="dash-accounts__state">
                {[session.current ? "This device" : null, session.signedInText, session.ipAddress]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
              {!session.current && (
                <span className="dash-accounts__action">
                  <button
                    type="button"
                    className="button hollow"
                    disabled={busy !== null}
                    aria-busy={busy === session.id}
                    onClick={() => void run(session.id, () => signOutDevice(session.id))}
                  >
                    {busy === session.id && <Loader />}
                    Sign out
                  </button>
                </span>
              )}
            </li>
          );
        })}
      </ul>

      {others > 1 && (
        <div className="dash-sessions__all">
          <button
            type="button"
            className="button hollow button--danger"
            disabled={busy !== null}
            aria-busy={busy === ALL}
            onClick={() => void run(ALL, signOutOtherDevices)}
          >
            {busy === ALL && <Loader />}
            Sign out all other devices
          </button>
        </div>
      )}

      {problem && (
        <p className="dash-accounts__problem" role="alert">
          {problem}
        </p>
      )}
    </>
  );
}
