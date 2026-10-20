"use client";

import { useMemo, useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { deleteOwnedLog } from "@/app/dash/actions";
import type { OwnedLog } from "@/lib/dashboard";
import { ConfirmDialog } from "../confirm-dialog";
import { Segmented } from "../workspace/segmented";
import { LogTable } from "./log-table";
import { EmptyState } from "./panel";

type Filter = "all" | "errors" | "clean";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "errors", label: "With errors" },
  { value: "clean", label: "No errors" },
];

export function LogsBrowser({ logs }: { logs: OwnedLog[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [gone, setGone] = useState<ReadonlySet<string>>(new Set());
  const [pending, setPending] = useState<OwnedLog | null>(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const live = useMemo(() => logs.filter((log) => !gone.has(log.id)), [logs, gone]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return live.filter((log) => {
      if (needle && !log.id.toLowerCase().includes(needle)) return false;
      if (filter === "errors") return log.errorCount > 0;
      if (filter === "clean") return log.errorCount === 0;
      return true;
    });
  }, [live, query, filter]);

  function close() {
    if (busy) return;
    setPending(null);
    setProblem(null);
  }

  async function confirm() {
    if (!pending || busy) return;
    setBusy(true);
    setProblem(null);
    const outcome = await deleteOwnedLog(pending.id);
    setBusy(false);
    if (!outcome.ok) {
      setProblem(outcome.error);
      return;
    }
    setGone((current) => new Set(current).add(pending.id));
    setPending(null);
  }

  return (
    <section className="dash-panel">
      <div className="dash-toolbar">
        <div className="search">
          <label htmlFor="log-search" className="show-for-sr">
            Search by log id
          </label>
          <MagnifyingGlass aria-hidden="true" className="search__icon" />
          <input
            id="log-search"
            type="search"
            className="search__input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by log id"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <Segmented label="Filter logs" options={FILTERS} value={filter} onChange={setFilter} />
        <p className="dash-toolbar__count" aria-live="polite">
          {visible.length === live.length
            ? `${live.length.toLocaleString("en")} ${live.length === 1 ? "log" : "logs"}`
            : `${visible.length.toLocaleString("en")} of ${live.length.toLocaleString("en")}`}
        </p>
      </div>

      {visible.length > 0 ? (
        <LogTable logs={visible} onDelete={setPending} />
      ) : (
        <EmptyState title={live.length === 0 ? "No logs left" : "No matches"}>
          {live.length === 0
            ? "Everything you saved has been deleted or has expired."
            : "No log matches that search and filter."}
        </EmptyState>
      )}

      <ConfirmDialog
        open={pending !== null}
        busy={busy}
        problem={problem}
        title="Delete this log?"
        confirmLabel="Delete log"
        busyLabel="Deleting"
        onConfirm={() => void confirm()}
        onClose={close}
      >
        {pending ? `${pending.id} ` : ""}stops working for everyone right away, including anyone
        you sent the link to. This can&apos;t be undone.
      </ConfirmDialog>
    </section>
  );
}
