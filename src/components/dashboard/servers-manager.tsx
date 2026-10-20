"use client";

import { useId, useState } from "react";
import { HardDrives, LinkBreak, PencilSimple, Plus } from "@phosphor-icons/react";
import {
  addServer,
  removeServer,
  renameServerAction,
} from "@/app/dash/servers/actions";
import type { ServerView } from "@/lib/dashboard-views";
import { LABEL_MAX } from "@/lib/label";
import { CopyLink } from "../copy-link";
import { ConfirmDialog } from "../confirm-dialog";
import { Loader } from "../loader";
import { Modal } from "../modal";
import { EmptyState, PageHeader, Panel } from "./panel";

function NameDialog({
  title,
  action,
  initial,
  placeholder,
  hint,
  onSubmit,
  onClose,
}: {
  title: string;
  action: string;
  initial: string;
  placeholder: string;
  hint?: string;
  onSubmit: (name: string) => Promise<string | null>;
  onClose: () => void;
}) {
  const id = useId();
  const [name, setName] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  async function submit() {
    if (busy) return;
    setBusy(true);
    setProblem(null);
    const error = await onSubmit(name);
    setBusy(false);
    if (error) setProblem(error);
  }

  return (
    <Modal open busy={busy} title={title} onClose={onClose} onSubmit={() => void submit()}>
      <div className="dash-form">
        <div className="dash-form__field">
          <label htmlFor={id} className="dash-form__label">
            Name
          </label>
          <input
            id={id}
            className="dash-input"
            type="text"
            value={name}
            maxLength={LABEL_MAX}
            autoComplete="off"
            data-autofocus
            placeholder={placeholder}
            onChange={(event) => setName(event.target.value)}
          />
          {hint && <p className="dash-form__hint">{hint}</p>}
        </div>
      </div>
      <div className="dialog__actions">
        <button type="submit" className="button button--sm" disabled={busy} aria-busy={busy}>
          {busy && <Loader />}
          {action}
        </button>
      </div>
      {problem && (
        <p className="dialog__problem" role="alert">
          {problem}
        </p>
      )}
    </Modal>
  );
}

export function ServersManager({ servers, limit }: { servers: ServerView[]; limit: number }) {
  const [adding, setAdding] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<ServerView | null>(null);
  const [revoking, setRevoking] = useState<ServerView | null>(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const full = servers.length >= limit;

  async function confirmRevoke() {
    if (!revoking || busy) return;
    setBusy(true);
    setProblem(null);
    const outcome = await removeServer(revoking.id);
    setBusy(false);
    if (!outcome.ok) {
      setProblem(outcome.error);
      return;
    }
    setRevoking(null);
  }

  return (
    <>
      <PageHeader
        title="Servers"
        description="Each Minecraft server connects with its own key. Create one here, then run it on the server."
        actions={
          <div className="dash-page__counter">
            <span className="dash-page__count">
              {servers.length} / {limit}
            </span>
            <button
              type="button"
              className="button"
              disabled={full}
              data-tip={full ? `You can connect up to ${limit} servers` : undefined}
              onClick={() => setAdding(true)}
            >
              <Plus size={18} aria-hidden="true" />
              Add server
            </button>
          </div>
        }
      />

      {servers.length === 0 ? (
        <Panel title="Connected servers">
          <EmptyState title="No servers yet">
            Add a server to get its key. minelog names it after the server version the first time it
            connects.
          </EmptyState>
        </Panel>
      ) : (
        <Panel title="Connected servers" flush>
          <ul className="dash-hooks">
            {servers.map((server) => (
              <li key={server.id} className="dash-hook">
                <span className="dash-hook__icon">
                  <HardDrives size={22} aria-hidden="true" />
                </span>
                <div className="dash-hook__main">
                  <p className="dash-hook__name">{server.name}</p>
                  {server.detail && <p className="dash-hook__events">{server.detail}</p>}
                  <p className="dash-hook__url">{server.keyPrefix}…</p>
                  <p
                    className={`dash-hook__status dash-hook__status--${server.connected ? "ok" : "idle"}`}
                  >
                    <span className="dash-hook__dot" aria-hidden="true" />
                    {server.seenText}
                  </p>
                </div>
                <div className="dash-hook__actions">
                  <button
                    type="button"
                    className="nav-button nav-button--icon dash-hook__button"
                    aria-label={`Rename ${server.name}`}
                    data-tip="Rename"
                    onClick={() => setRenaming(server)}
                  >
                    <PencilSimple size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="nav-button nav-button--icon dash-hook__button dash-hook__button--danger"
                    aria-label={`Revoke the key for ${server.name}`}
                    data-tip="Revoke key"
                    onClick={() => setRevoking(server)}
                  >
                    <LinkBreak size={16} aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {adding && (
        <NameDialog
          title="Add a server"
          action="Create key"
          initial=""
          placeholder="Optional"
          hint="Leave it empty and minelog names the server after its version when it connects."
          onClose={() => setAdding(false)}
          onSubmit={async (name) => {
            const outcome = await addServer(name);
            if (!outcome.ok) return outcome.error;
            setAdding(false);
            setCreatedKey(outcome.key);
            return null;
          }}
        />
      )}

      {createdKey && (
        <Modal open title="Your server key" wide onClose={() => setCreatedKey(null)}>
          <div className="dash-form">
            <p className="dash-form__text">
              Run this on your server, in the console or in game. It&apos;s shown only once, so copy
              it now.
            </p>
            <CopyLink url={`/minelog auth ${createdKey}`} block />
            <p className="dash-form__hint">
              If you lose it, revoke the key and create a new one. Anyone with the key can send
              events as this server.
            </p>
          </div>
          <div className="dialog__actions">
            <button type="button" className="button button--sm" onClick={() => setCreatedKey(null)}>
              Done
            </button>
          </div>
        </Modal>
      )}

      {renaming && (
        <NameDialog
          key={renaming.id}
          title="Rename server"
          action="Save name"
          initial={renaming.name}
          placeholder="Server name"
          onClose={() => setRenaming(null)}
          onSubmit={async (name) => {
            const outcome = await renameServerAction(renaming.id, name);
            if (!outcome.ok) return outcome.error;
            setRenaming(null);
            return null;
          }}
        />
      )}

      <ConfirmDialog
        open={revoking !== null}
        busy={busy}
        problem={problem}
        title="Revoke this key?"
        confirmLabel="Revoke key"
        busyLabel="Revoking"
        icon={<LinkBreak aria-hidden="true" />}
        onConfirm={() => void confirmRevoke()}
        onClose={() => {
          if (busy) return;
          setRevoking(null);
          setProblem(null);
        }}
      >
        {revoking ? `${revoking.name} ` : ""}will stop sending events right away. You can create a
        new key for it later.
      </ConfirmDialog>
    </>
  );
}
