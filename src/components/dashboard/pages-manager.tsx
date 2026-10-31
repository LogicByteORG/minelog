"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowSquareOut, Key, PencilSimple, Plus } from "@phosphor-icons/react";
import { addPage } from "@/app/dash/pages/actions";
import type { LogoSources } from "@/lib/page-settings";
import { Loader } from "../loader";
import { EmptyState, Notice, PageHeader, Panel } from "./panel";

export type PageSummary = {
  id: string;
  name: string | null;
  slug: string;
  logo: LogoSources;
  background: string | null;
  logCount: number;
  lastLog: string | null;
  keyPrefix: string | null;
  domain: string | null;
};

const count = (value: number) => value.toLocaleString("en");

function PageCard({ page }: { page: PageSummary }) {
  return (
    <li className="page-card">
      <div className="page-card__brand" style={page.background ? { background: page.background } : undefined}>
        {page.logo ? (
          <>
            <Image
              className="page-card__logo page-card__logo--light"
              src={page.logo.light}
              width={240}
              height={40}
              alt=""
              unoptimized
            />
            <Image
              className="page-card__logo page-card__logo--dark"
              src={page.logo.dark}
              width={240}
              height={40}
              alt=""
              unoptimized
            />
          </>
        ) : (
          <span className="page-card__empty">No logo yet</span>
        )}
      </div>
      <div className="page-card__body">
        <div>
          <p className="page-card__name">{page.name ?? "Untitled page"}</p>
          <p className="dash-hook__url">{page.domain ?? `minelog.org/c/${page.slug}`}</p>
        </div>
        <p className="page-card__stats">
          <span>
            {count(page.logCount)} {page.logCount === 1 ? "log" : "logs"}
          </span>
          <span>{page.lastLog ? `Last ${page.lastLog}` : "No logs yet"}</span>
        </p>
        <p className="page-card__stats">
          <span>
            <Key size={14} aria-hidden="true" />{" "}
            {page.keyPrefix ? `${page.keyPrefix}…` : "No API key yet"}
          </span>
        </p>
        <div className="page-card__actions">
          <Link href={`/dash/pages/${page.id}`} className="button button--sm">
            <PencilSimple size={16} aria-hidden="true" />
            Customize
          </Link>
          <a
            href={`/c/${page.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="button hollow button--sm"
          >
            <ArrowSquareOut size={16} aria-hidden="true" />
            Open demo
          </a>
        </div>
      </div>
    </li>
  );
}

export function PagesManager({ pages, limit }: { pages: PageSummary[]; limit: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const full = pages.length >= limit;

  async function create() {
    if (busy) return;
    setBusy(true);
    setProblem(null);
    const outcome = await addPage();
    if (!outcome.ok) {
      setBusy(false);
      setProblem(outcome.error);
      return;
    }
    router.push(`/dash/pages/${outcome.id}`);
  }

  return (
    <>
      <PageHeader
        title="Custom log pages"
        description="Logs your app saves through the minelog API open on a page with your logo, colors and buttons."
        actions={
          <div className="dash-page__counter">
            <span className="dash-page__count">
              {pages.length} / {limit}
            </span>
            <button
              type="button"
              className="button"
              disabled={full || busy}
              aria-busy={busy}
              data-tip={full ? `You can have up to ${limit} custom pages` : undefined}
              onClick={() => void create()}
            >
              {busy ? <Loader /> : <Plus size={18} aria-hidden="true" />}
              New log page
            </button>
          </div>
        }
      />

      {problem && <Notice>{problem}</Notice>}

      {pages.length === 0 ? (
        <Panel title="Your pages">
          <EmptyState title="No custom pages yet">
            Create a page, add your logo and colors, then generate its API key. Every log your app
            saves with that key opens in your brand.
          </EmptyState>
        </Panel>
      ) : (
        <ul className="page-cards">
          {pages.map((page) => (
            <PageCard key={page.id} page={page} />
          ))}
        </ul>
      )}
    </>
  );
}
