"use client";

import { useId, useState, type FormEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { PencilSimple } from "@phosphor-icons/react";
import { authClient } from "@/lib/auth-client";
import { MAX_NAME_LENGTH, nameShapeProblem, normalizeName } from "@/lib/display-name";
import { Loader } from "../loader";

export function DisplayNameForm({ name }: { name: string }) {
  const router = useRouter();
  const inputId = useId();
  const [saved, setSaved] = useState(name);
  const [value, setValue] = useState(name);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const clean = normalizeName(value);
  const changed = clean !== saved;

  function startEditing() {
    setValue(saved);
    setProblem(null);
    setDone(false);
    setEditing(true);
  }

  function cancel() {
    if (busy) return;
    setEditing(false);
    setProblem(null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!changed || busy) return;

    const shape = nameShapeProblem(clean);
    if (shape) {
      setProblem(shape);
      return;
    }

    setBusy(true);
    setProblem(null);
    const { error } = await authClient.updateUser({ name: clean });
    setBusy(false);
    if (error) {
      setProblem(error.message ?? "Couldn't save the name. Try again in a moment.");
      return;
    }
    setSaved(clean);
    setEditing(false);
    setDone(true);
    router.refresh();
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      cancel();
    }
  }

  if (!editing) {
    return (
      <div className="dash-name">
        <span className="dash-name__value">{saved}</span>
        <button
          type="button"
          className="nav-button nav-button--icon dash-name__edit"
          aria-label="Edit display name"
          data-tip="Edit display name"
          onClick={startEditing}
        >
          <PencilSimple size={16} aria-hidden="true" />
        </button>
        {done && (
          <span className="dash-name__note" role="status">
            Name updated.
          </span>
        )}
      </div>
    );
  }

  return (
    <form className="dash-name dash-name--editing" onSubmit={(event) => void submit(event)} noValidate>
      <label htmlFor={inputId} className="show-for-sr">
        Display name
      </label>
      <input
        id={inputId}
        className="dash-input"
        type="text"
        value={value}
        maxLength={MAX_NAME_LENGTH}
        autoComplete="off"
        spellCheck={false}
        autoFocus
        aria-invalid={problem !== null}
        aria-describedby={problem ? `${inputId}-problem` : undefined}
        onKeyDown={onKeyDown}
        onChange={(event) => {
          setValue(event.target.value);
          setProblem(null);
        }}
      />
      <button type="submit" className="button dash-name__button" disabled={!changed || busy}>
        {busy && <Loader />}
        Save
      </button>
      <button
        type="button"
        className="button hollow dash-name__button"
        disabled={busy}
        onClick={cancel}
      >
        Cancel
      </button>
      {problem && (
        <p id={`${inputId}-problem`} className="dash-name__note dash-name__note--error" role="alert">
          {problem}
        </p>
      )}
    </form>
  );
}
