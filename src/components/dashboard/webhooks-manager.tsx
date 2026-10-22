"use client";

import { useState } from "react";
import { PaperPlaneTilt, PencilSimple, Plus, Trash } from "@phosphor-icons/react";
import { changeWebhook, removeWebhook, testWebhook } from "@/app/dash/webhooks/actions";
import type { ServerOption, WebhookView } from "@/lib/dashboard-views";
import { KIND_LABEL } from "@/lib/webhook-url";
import { ConfirmDialog } from "../confirm-dialog";
import { Loader } from "../loader";
import { Toggle } from "../switch-row";
import { HandleChip } from "./handle-chip";
import { EmptyState, PageHeader, Panel } from "./panel";
import { WebhookDialog } from "./webhook-dialog";
import { WebhookIcon } from "./webhook-icon";

export function WebhooksManager({
  hooks,
  servers,
  limit,
}: {
  hooks: WebhookView[];
  servers: ServerOption[];
  limit: number;
}) {
  const [dialog, setDialog] = useState<{ editing: WebhookView | null } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<WebhookView | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteProblem, setDeleteProblem] = useState<string | null>(null);
  const [working, setWorking] = useState<string | null>(null);
  const [note, setNote] = useState<{ id: string; ok: boolean; text: string } | null>(null);

  const full = hooks.length >= limit;

  async function toggle(hook: WebhookView, enabled: boolean) {
    setWorking(hook.id);
    setNote(null);
    const outcome = await changeWebhook(hook.id, { enabled });
    setWorking(null);
    if (!outcome.ok) setNote({ id: hook.id, ok: false, text: outcome.error });
  }

  async function test(hook: WebhookView) {
    setWorking(hook.id);
    setNote(null);
    const outcome = await testWebhook(hook.id);
    setWorking(null);
    setNote({
      id: hook.id,
      ok: outcome.ok,
      text: outcome.ok ? "Test message sent." : outcome.error,
    });
  }

  async function confirmDelete() {
    if (!pendingDelete || deleting) return;
    setDeleting(true);
    setDeleteProblem(null);
    const outcome = await removeWebhook(pendingDelete.id);
    setDeleting(false);
    if (!outcome.ok) {
      setDeleteProblem(outcome.error);
      return;
    }
    setPendingDelete(null);
  }

  return (
    <>
      <PageHeader
        title="Webhooks"
        description="Where your servers send their alerts: Discord, Slack, Teams and more, or your own URL. Scripts can pick one by its handle."
        actions={
          <div className="dash-page__counter">
            <span className="dash-page__count">
              {hooks.length} / {limit}
            </span>
            <button
              type="button"
              className="button"
              disabled={full}
              data-tip={full ? `You can add up to ${limit} webhooks` : undefined}
              onClick={() => setDialog({ editing: null })}
            >
              <Plus size={18} aria-hidden="true" />
              Add webhook
            </button>
          </div>
        }
      />

      {hooks.length === 0 ? (
        <Panel title="Endpoints">
          <EmptyState title="No webhooks yet">
            Paste a webhook URL from Discord, Slack, Teams or another platform. We detect which one it is for you.
          </EmptyState>
        </Panel>
      ) : (
        <Panel title="Endpoints" flush>
          <ul className="dash-hooks">
            {hooks.map((hook) => {
              const busy = working === hook.id;
              return (
                <li key={hook.id} className="dash-hook">
                  <span className="dash-hook__icon">
                    <WebhookIcon kind={hook.kind} size={22} />
                  </span>
                  <div className="dash-hook__main">
                    <p className="dash-hook__name">
                      {hook.name}
                      <span className="dash-tag">{KIND_LABEL[hook.kind]}</span>
                    </p>
                    <p className="dash-hook__url">{hook.urlHint}</p>
                    <p className="dash-hook__scope">
                      <HandleChip handle={hook.handle} />
                      {(servers.length >= 1 || hook.serverIds !== null) && (
                        <> · {hook.scopeText}</>
                      )}
                    </p>
                    <p className={`dash-hook__status dash-hook__status--${hook.statusTone}`}>
                      <span className="dash-hook__dot" aria-hidden="true" />
                      {hook.statusText}
                    </p>
                    {note?.id === hook.id && (
                      <p
                        className={note.ok ? "dash-hook__note" : "dash-hook__note dash-hook__note--error"}
                        role={note.ok ? "status" : "alert"}
                      >
                        {note.text}
                      </p>
                    )}
                  </div>
                  <div className="dash-hook__actions">
                    <Toggle
                      id={`hook-${hook.id}`}
                      label={`${hook.name} enabled`}
                      checked={hook.enabled}
                      disabled={busy}
                      onChange={(enabled) => void toggle(hook, enabled)}
                    />
                    <button
                      type="button"
                      className="nav-button nav-button--icon dash-hook__button"
                      aria-label={`Send a test to ${hook.name}`}
                      data-tip="Send a test message"
                      disabled={busy}
                      onClick={() => void test(hook)}
                    >
                      {busy ? <Loader /> : <PaperPlaneTilt size={16} aria-hidden="true" />}
                    </button>
                    <button
                      type="button"
                      className="nav-button nav-button--icon dash-hook__button"
                      aria-label={`Edit ${hook.name}`}
                      data-tip="Edit"
                      onClick={() => setDialog({ editing: hook })}
                    >
                      <PencilSimple size={16} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="nav-button nav-button--icon dash-hook__button dash-hook__button--danger"
                      aria-label={`Delete ${hook.name}`}
                      data-tip="Delete"
                      onClick={() => setPendingDelete(hook)}
                    >
                      <Trash size={16} aria-hidden="true" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>
      )}

      {dialog && (
        <WebhookDialog
          key={dialog.editing?.id ?? "new"}
          editing={dialog.editing}
          servers={servers}
          onClose={() => setDialog(null)}
        />
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        busy={deleting}
        problem={deleteProblem}
        title="Delete this webhook?"
        confirmLabel="Delete webhook"
        busyLabel="Deleting"
        onConfirm={() => void confirmDelete()}
        onClose={() => {
          if (deleting) return;
          setPendingDelete(null);
          setDeleteProblem(null);
        }}
      >
        {pendingDelete ? `${pendingDelete.name} ` : ""}will stop receiving alerts right away. This
        can&apos;t be undone.
      </ConfirmDialog>
    </>
  );
}
