"use client";

import { useId, useMemo, useState } from "react";
import { addWebhook, changeWebhook } from "@/app/dash/webhooks/actions";
import type { ServerOption, WebhookView } from "@/lib/dashboard-views";
import { HANDLE_MAX, handleFromName, normalizeHandle } from "@/lib/handle";
import { LABEL_MAX } from "@/lib/label";
import { KIND_LABEL, detectWebhook } from "@/lib/webhook-url";
import { Loader } from "../loader";
import { Modal } from "../modal";
import { PlatformsModal } from "./platforms-modal";
import { WebhookIcon } from "./webhook-icon";

export function WebhookDialog({
  editing,
  servers,
  onClose,
}: {
  editing: WebhookView | null;
  servers: ServerOption[];
  onClose: () => void;
}) {
  const id = useId();
  const [url, setUrl] = useState("");
  const [name, setName] = useState(editing?.name ?? "");
  const [handle, setHandle] = useState(editing?.handle ?? "");
  const [everywhere, setEverywhere] = useState(editing?.serverIds == null);
  const [picked, setPicked] = useState<string[]>(editing?.serverIds ?? []);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [showPlatforms, setShowPlatforms] = useState(false);

  const detected = useMemo(() => detectWebhook(url), [url]);
  const typed = url.trim().length > 0;
  const showScope =
    servers.length >= 2 || (editing?.serverIds ?? null) !== null;

  const suggested = handleFromName(
    name || (detected.ok ? KIND_LABEL[detected.kind] : ""),
  );
  const shownHandle = handle.trim() === "" ? suggested : handle.trim();
  const handleProblem =
    handle.trim() !== "" && normalizeHandle(handle) === null
      ? "Use lowercase letters, numbers and dashes, up to 32 characters."
      : null;
  const renamed =
    editing !== null &&
    normalizeHandle(handle) !== null &&
    normalizeHandle(handle) !== editing.handle;

  function togglePicked(serverId: string, on: boolean) {
    setPicked((current) =>
      on ? [...current, serverId] : current.filter((item) => item !== serverId),
    );
  }

  async function submit() {
    if (busy) return;
    setBusy(true);
    setProblem(null);

    const serverIds = showScope ? (everywhere ? null : picked) : undefined;
    const outcome = editing
      ? await changeWebhook(editing.id, { name, handle, serverIds })
      : await addWebhook({ url, name, handle, serverIds });

    setBusy(false);
    if (!outcome.ok) {
      setProblem(outcome.error);
      return;
    }
    onClose();
  }

  const scopeReady = everywhere || picked.length > 0;
  const canSubmit =
    (editing !== null || detected.ok) && handleProblem === null && scopeReady;

  return (
    <>
      <Modal
        open
        wide
        busy={busy}
        title={editing ? "Edit webhook" : "Add a webhook"}
        onClose={() => {
          if (!busy) onClose();
        }}
        onSubmit={() => void submit()}
      >
        <div className="dash-form">
          {editing ? (
            <div className="dash-form__field">
              <span className="dash-form__label">Address</span>
              <p className="dash-form__static">
                <WebhookIcon kind={editing.kind} size={18} />
                <code>{editing.urlHint}</code>
              </p>
            </div>
          ) : (
            <div className="dash-form__field">
              <label htmlFor={`${id}-url`} className="dash-form__label">
                Webhook URL
              </label>
              <input
                id={`${id}-url`}
                className="dash-input"
                type="text"
                value={url}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                data-autofocus
                placeholder="https://discord.com/api/webhooks/..."
                aria-invalid={typed && url.trim().length >= 12 && !detected.ok}
                onChange={(event) => {
                  setUrl(event.target.value);
                  setProblem(null);
                }}
              />
              <p className="dash-form__hint" aria-live="polite">
                {detected.ok ? (
                  <span className="dash-form__detected">
                    <WebhookIcon kind={detected.kind} size={16} />
                    {KIND_LABEL[detected.kind]} webhook
                  </span>
                ) : typed && url.trim().length >= 12 ? (
                  <span className="dash-form__error">{detected.error}</span>
                ) : (
                  "Paste the URL and we'll work out whether it's Discord, Slack or something else."
                )}
              </p>
              <button
                type="button"
                className="dash-form__toggle"
                aria-haspopup="dialog"
                onClick={() => setShowPlatforms(true)}
              >
                See supported platforms
              </button>
            </div>
          )}

          <div className="dash-form__field">
            <label htmlFor={`${id}-name`} className="dash-form__label">
              Name
            </label>
            <input
              id={`${id}-name`}
              className="dash-input"
              type="text"
              value={name}
              maxLength={LABEL_MAX}
              autoComplete="off"
              placeholder={detected.ok ? KIND_LABEL[detected.kind] : "Optional"}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div className="dash-form__field">
            <label htmlFor={`${id}-handle`} className="dash-form__label">
              Handle
            </label>
            <input
              id={`${id}-handle`}
              className="dash-input"
              type="text"
              value={handle}
              maxLength={HANDLE_MAX}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              placeholder={suggested}
              aria-invalid={handleProblem !== null}
              onChange={(event) => setHandle(event.target.value)}
            />
            <p className="dash-form__hint">
              {handleProblem ? (
                <span className="dash-form__error">{handleProblem}</span>
              ) : renamed ? (
                <span className="dash-form__error">
                  Scripts that use &ldquo;{editing?.handle}&rdquo; will stop
                  reaching this webhook.
                </span>
              ) : (
                <>
                  Scripts pick this webhook by its handle:{" "}
                  <code className="dash-form__code">
                    to webhook &quot;{shownHandle}&quot;
                  </code>
                </>
              )}
            </p>
          </div>

          {showScope && (
            <fieldset className="dash-form__field">
              <legend className="dash-form__label">Alerts from</legend>
              <label className="dash-form__radio">
                <input
                  type="radio"
                  name={`${id}-scope`}
                  checked={everywhere}
                  onChange={() => setEverywhere(true)}
                />
                <span className="dash-form__radio-text">All servers</span>
              </label>
              <label className="dash-form__radio">
                <input
                  type="radio"
                  name={`${id}-scope`}
                  checked={!everywhere}
                  onChange={() => setEverywhere(false)}
                />
                <span className="dash-form__radio-text">Only some servers</span>
              </label>
              {!everywhere && (
                <div className="dash-form__servers">
                  {servers.map((server) => (
                    <label key={server.id} className="dash-form__radio">
                      <input
                        type="checkbox"
                        checked={picked.includes(server.id)}
                        onChange={(event) =>
                          togglePicked(server.id, event.target.checked)
                        }
                      />
                      <span className="dash-form__radio-text">
                        {server.name}
                      </span>
                    </label>
                  ))}
                </div>
              )}
              <p className="dash-form__hint">
                Used when a script doesn&apos;t name a webhook. Naming one
                always sends to it.
              </p>
            </fieldset>
          )}
        </div>

        <div className="dialog__actions">
          <button
            type="submit"
            className="button button--sm"
            disabled={!canSubmit || busy}
            aria-busy={busy}
          >
            {busy && <Loader />}
            {editing ? "Save changes" : "Add webhook"}
          </button>
        </div>

        {problem && (
          <p className="dialog__problem" role="alert">
            {problem}
          </p>
        )}
      </Modal>
      <PlatformsModal
        open={showPlatforms}
        onClose={() => setShowPlatforms(false)}
      />
    </>
  );
}
