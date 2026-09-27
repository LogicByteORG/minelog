"use client";

import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import { CaretDown, ListMagnifyingGlass } from "@phosphor-icons/react";
import {
  hasFindings,
  javaText,
  launcherText,
  loaderText,
  modsText,
} from "@/lib/diagnose/present";
import type { Environment, EnvironmentKey, Fact } from "@/lib/diagnose/types";
import { useFloatingMenu } from "@/lib/use-floating-menu";
import { LineLink } from "./line-link";

const LABEL: Record<EnvironmentKey, string> = {
  gameVersion: "Minecraft",
  loader: "Loader",
  java: "Java",
  launcher: "Launcher",
};

type Row = { key: EnvironmentKey; fact: Fact; text: string };

function rowsOf(env: Environment): Row[] {
  const rows: Row[] = [];
  if (env.gameVersion) {
    rows.push({ key: "gameVersion", fact: env.gameVersion, text: env.gameVersion.value });
  }
  if (env.loader) rows.push({ key: "loader", fact: env.loader, text: loaderText(env.loader) });
  if (env.java) rows.push({ key: "java", fact: env.java, text: javaText(env.java) });
  if (env.launcher) {
    rows.push({ key: "launcher", fact: env.launcher, text: launcherText(env.launcher) });
  }
  return rows;
}

export function AnalyzeMenu({ env }: { env: Environment }) {
  const { open, pos, button, menu, toggle, close } = useFloatingMenu<HTMLDivElement>();

  if (!hasFindings(env)) return null;

  const rows = rowsOf(env);
  const mods = modsText(env.mods, env.bundled);

  return (
    <div className="analyze">
      <button
        type="button"
        ref={button}
        className="button hollow button--sm"
        aria-haspopup="dialog"
        aria-expanded={open}
        data-tip="Minecraft version, loader, Java and mods"
        onClick={toggle}
      >
        <ListMagnifyingGlass aria-hidden="true" />
        Analyze
        <CaretDown aria-hidden="true" />
      </button>
      {open &&
        createPortal(
          <div
            role="dialog"
            aria-label="What this log was made with"
            ref={menu}
            className="analyze__panel"
            style={{ top: pos.top, "--analyze-right": `${pos.right}px` } as CSSProperties}
          >
            <dl className="analyze__rows">
              {rows.map(({ key, fact, text }) => (
                <div key={key} className="analyze__row">
                  <dt>{LABEL[key]}</dt>
                  <dd>
                    <span className="analyze__value">{text}</span>
                    {fact.confidence === "medium" && (
                      <span
                        className="analyze__likely"
                        data-tip="Only one kind of line in the log says this"
                      >
                        likely
                      </span>
                    )}
                    {fact.lines[0] !== undefined && (
                      <LineLink line={fact.lines[0]} onJump={close} />
                    )}
                    {fact.others.map((other) => (
                      <span key={other.value} className="analyze__note">
                        The log also mentions {other.value} (
                        <LineLink line={other.lines[0]} onJump={close} />
                        ).
                      </span>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>

            {env.conflicts.length > 0 && (
              <p className="analyze__note">
                The log says two different things about{" "}
                {env.conflicts.map((key) => LABEL[key]).join(" and ")}, so we
                aren&apos;t picking one.
              </p>
            )}

            {env.mods.length > 0 && (
              <section className="analyze__mods" aria-label={mods}>
                <h3>{mods}</h3>
                <ul>
                  {env.mods.map((mod) => (
                    <li key={`${mod.kind}:${mod.id ?? mod.name}`}>
                      <span>{mod.name}</span>
                      {mod.version && <span className="analyze__version">{mod.version}</span>}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <p className="analyze__foot">
              Taken from the log&apos;s own lines. We can&apos;t check that they&apos;re true.
            </p>
          </div>,
          document.body,
        )}
    </div>
  );
}

