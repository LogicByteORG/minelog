"use client";

import Link from "next/link";
import { useState } from "react";
import { Trash } from "@phosphor-icons/react";
import { removeAlert } from "@/app/dash/alerts/actions";
import type { AlertGroup, AlertView } from "@/lib/dashboard-views";
import { ConfirmDialog } from "../confirm-dialog";
import { Panel } from "./panel";

export function AlertsList({ groups }: { groups: AlertGroup[] }) {
  const [pending, setPending] = useState<AlertView | null>(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  async function confirm() {
    if (!pending || busy) return;
    setBusy(true);
    setProblem(null);
    const outcome = await removeAlert(pending.id);
    setBusy(false);
    if (!outcome.ok) {
      setProblem(outcome.error);
      return;
    }
    setPending(null);
  }

  return (
    <>
      {groups.map((group) => (
        <Panel
          key={group.serverId}
          title={group.serverName}
          description={`${group.alerts.length} ${group.alerts.length === 1 ? "error" : "errors"}`}
          flush
        >
          <ul className="dash-alerts">
            {group.alerts.map((alert) => (
              <li key={alert.id} className="dash-alert">
                <div className="dash-alert__main">
                  <Link href={`/dash/alerts/${alert.id}`} className="dash-alert__summary">
                    {alert.summary}
                  </Link>
                  <p className="dash-alert__meta">
                    <span className="dash-alert__count">
                      ×{alert.occurrences.toLocaleString("en")}
                    </span>
                    <span>Last seen {alert.lastSeenText}</span>
                    <span>Deleted on {alert.expiresText}</span>
                  </p>
                </div>
                <button
                  type="button"
                  className="nav-button nav-button--icon dash-table__action"
                  aria-label="Delete this alert"
                  data-tip="Delete"
                  onClick={() => setPending(alert)}
                >
                  <Trash size={16} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </Panel>
      ))}

      <ConfirmDialog
        open={pending !== null}
        busy={busy}
        problem={problem}
        title="Delete this alert?"
        confirmLabel="Delete alert"
        busyLabel="Deleting"
        onConfirm={() => void confirm()}
        onClose={() => {
          if (busy) return;
          setPending(null);
          setProblem(null);
        }}
      >
        The saved log lines are removed right away. If the same error shows up again, it starts a
        new alert.
      </ConfirmDialog>
    </>
  );
}
