"use client";

import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import { CaretDown, WarningCircle } from "@phosphor-icons/react";
import type { Problem } from "@/lib/diagnose/problems";
import { useFloatingMenu } from "@/lib/use-floating-menu";
import { LineLink } from "./line-link";

export function ProblemsPanel({ problems }: { problems: Problem[] }) {
  const { open, pos, button, menu, toggle, close } = useFloatingMenu<HTMLDivElement>();

  if (problems.length === 0) return null;

  const label = problems.length === 1 ? "1 problem" : `${problems.length} problems`;

  return (
    <div className="problems">
      <button
        type="button"
        ref={button}
        className="button hollow button--sm"
        aria-haspopup="dialog"
        aria-expanded={open}
        data-tip="What looks wrong in this log"
        onClick={toggle}
      >
        <WarningCircle aria-hidden="true" />
        Problems ({problems.length})
        <CaretDown aria-hidden="true" />
      </button>
      {open &&
        createPortal(
          <div
            role="dialog"
            aria-label={`Found ${label} in this log`}
            ref={menu}
            className="problems__panel"
            style={{ top: pos.top, "--problems-right": `${pos.right}px` } as CSSProperties}
          >
            <p className="problems__head">{label} found in this log.</p>
            <ul className="problems__list">
              {problems.map((problem) => (
                <li key={`${problem.id}:${problem.line}`} className="problems__item">
                  <p className="problems__message">
                    {problem.message}{" "}
                    <LineLink line={problem.line} onJump={close} />
                    {problem.count > 1 && (
                      <span className="problems__count">Seen {problem.count} times.</span>
                    )}
                  </p>
                  <ul className="problems__solutions">
                    {problem.solutions.map((solution) => (
                      <li key={solution}>{solution}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
            <p className="problems__foot">
              Taken from the log&apos;s own lines. We can&apos;t check that they&apos;re right.
            </p>
          </div>,
          document.body,
        )}
    </div>
  );
}
