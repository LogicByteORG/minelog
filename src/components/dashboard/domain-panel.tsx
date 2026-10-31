"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowClockwise, ArrowSquareOut, CheckCircle, Globe, Trash } from "@phosphor-icons/react";
import { attachDomain, detachDomain, refreshDomain } from "@/app/dash/pages/actions";
import {
  dnsRecords,
  type DnsRecord,
  type DomainState,
} from "@/lib/domain-settings";
import { ConfirmDialog } from "../confirm-dialog";
import { Loader } from "../loader";
import { HandleChip } from "./handle-chip";
import { Notice } from "./panel";

export type DomainInfo = { host: string; state: DomainState } | null;

type Props = {
  pageId: string;
  initial: DomainInfo;
  enabled: boolean;
};

function Records({ records }: { records: DnsRecord[] }) {
  return (
    <ul className="page-dns" aria-label="DNS records to add">
      {records.map((record) => (
        <li key={`${record.type}-${record.name}`} className="page-dns__row">
          <span className="page-dns__type">{record.type}</span>
          <span className="page-dns__cell">
            <span className="page-field__label">Name</span>
            <HandleChip handle={record.name} tip="Copy the name" />
          </span>
          <span className="page-dns__cell">
            <span className="page-field__label">Value</span>
            <HandleChip handle={record.value} tip="Copy the value" />
          </span>
        </li>
      ))}
    </ul>
  );
}

export function DomainPanel({ pageId, initial, enabled }: Props) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [domain, setDomain] = useState<DomainInfo>(initial);
  const [records, setRecords] = useState<DnsRecord[]>(
    initial && initial.state === "pending" ? dnsRecords(initial.host, null) : [],
  );
  const [busy, setBusy] = useState<"add" | "check" | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);
  const [removeBusy, setRemoveBusy] = useState(false);
  const [removeProblem, setRemoveProblem] = useState<string | null>(null);

  function show(outcome: Awaited<ReturnType<typeof attachDomain>>) {
    if (!outcome.ok) {
      setProblem(outcome.error);
      return;
    }
    setProblem(null);
    setDomain({ host: outcome.host, state: outcome.state });
    setRecords(outcome.records);
    router.refresh();
  }

  async function add() {
    if (busy) return;
    setBusy("add");
    setProblem(null);
    const outcome = await attachDomain(pageId, input);
    setBusy(null);
    if (outcome.ok) setInput("");
    show(outcome);
  }

  async function check() {
    if (busy) return;
    setBusy("check");
    setProblem(null);
    const outcome = await refreshDomain(pageId);
    setBusy(null);
    show(outcome);
  }

  async function remove() {
    if (removeBusy) return;
    setRemoveBusy(true);
    setRemoveProblem(null);
    const outcome = await detachDomain(pageId);
    setRemoveBusy(false);
    if (!outcome.ok) {
      setRemoveProblem(outcome.error);
      return;
    }
    setRemoving(false);
    setDomain(null);
    setRecords([]);
    router.refresh();
  }

  if (!enabled) {
    return (
      <p className="page-field__hint">
        Custom domains aren&apos;t switched on for this deployment yet.
      </p>
    );
  }

  if (!domain) {
    return (
      <form
        className="page-field"
        onSubmit={(event) => {
          event.preventDefault();
          void add();
        }}
      >
        <label htmlFor={`${pageId}-domain`} className="page-field__label">
          Domain
        </label>
        <div className="page-domain">
          <input
            id={`${pageId}-domain`}
            className="dash-input"
            type="text"
            value={input}
            maxLength={253}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="logs.yoursite.com"
            onChange={(event) => setInput(event.target.value)}
          />
          <button
            type="submit"
            className="button"
            disabled={busy !== null || input.trim() === ""}
            aria-busy={busy === "add"}
          >
            {busy === "add" && <Loader />}
            Connect domain
          </button>
        </div>
        {problem && <Notice>{problem}</Notice>}
        <p className="page-field__hint">
          Use a subdomain you own, like logs.yoursite.com. Your logs then open at that address
          instead of minelog.org.
        </p>
      </form>
    );
  }

  const active = domain.state === "active";

  return (
    <>
      <p className="page-key">
        {active ? <CheckCircle size={18} weight="fill" aria-hidden="true" /> : <Globe size={18} aria-hidden="true" />}
        <span>
          <code>{domain.host}</code> {active ? "is live" : "is waiting for your DNS"}
        </span>
      </p>

      {active ? (
        <p className="page-field__hint">
          Logs saved with this page&apos;s API key now open at https://{domain.host}/&lt;log id&gt;.
        </p>
      ) : (
        <>
          <p className="page-field__hint">
            Add {records.length === 1 ? "this record" : "these records"} at the company that
            manages your domain&apos;s DNS. Changes can take a few minutes, sometimes longer.
          </p>
          <Records records={records} />
        </>
      )}

      {problem && <Notice>{problem}</Notice>}

      <div className="page-domain__actions">
        {!active && (
          <button
            type="button"
            className="button"
            disabled={busy !== null}
            aria-busy={busy === "check"}
            onClick={() => void check()}
          >
            {busy === "check" ? <Loader /> : <ArrowClockwise size={16} aria-hidden="true" />}
            Check DNS
          </button>
        )}
        {active && (
          <a
            href={`https://${domain.host}`}
            target="_blank"
            rel="noopener noreferrer"
            className="button hollow"
          >
            <ArrowSquareOut size={16} aria-hidden="true" />
            Open domain
          </a>
        )}
        <button type="button" className="button hollow" onClick={() => setRemoving(true)}>
          <Trash size={16} aria-hidden="true" />
          Remove domain
        </button>
      </div>

      <ConfirmDialog
        open={removing}
        busy={removeBusy}
        problem={removeProblem}
        title="Remove this domain?"
        confirmLabel="Remove domain"
        busyLabel="Removing"
        icon={<Trash aria-hidden="true" />}
        onConfirm={() => void remove()}
        onClose={() => {
          if (removeBusy) return;
          setRemoving(false);
          setRemoveProblem(null);
        }}
      >
        {domain.host} stops showing your logs. Links that use it will break, and logs
        saved from now on open at the normal minelog address. You can delete the DNS records afterwards.
      </ConfirmDialog>
    </>
  );
}
