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
          <div className="dash-table__wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th scope="col">Error</th>
                  <th scope="col" className="dash-table__num">
                    Seen
                  </th>
                  <th scope="col">Last seen</th>
                  <th scope="col">Deleted on</th>
                  <th scope="col" className="dash-table__end">
                    <span className="show-for-sr">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {group.alerts.map((alert) => (
                  <tr key={alert.id}>
                    <td>
                      <Link
                        href={`/dash/alerts/${alert.id}`}
                        className="dash-table__id dash-table__summary"
                        data-tip={alert.summary}
                      >
                        {alert.summary}
                      </Link>
                    </td>
                    <td className="dash-table__num">×{alert.occurrences.toLocaleString("en")}</td>
                    <td className="dash-table__times">{alert.lastSeenText}</td>
                    <td className="dash-table__times">{alert.expiresText}</td>
                    <td className="dash-table__end">
                      <button
                        type="button"
                        className="nav-button nav-button--icon dash-table__action"
                        aria-label="Delete this alert"
                        data-tip="Delete"
                        onClick={() => setPending(alert)}
                      >
                        <Trash size={16} aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
