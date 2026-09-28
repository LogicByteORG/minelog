"use client";

import {
  ArrowsInLineHorizontal,
  ArrowsOutLineHorizontal,
  CaretDown,
  CaretUp,
  Check,
  Copy,
  QrCode,
  SlidersHorizontal,
  WarningCircle,
} from "@phosphor-icons/react";
import { LEVEL_GROUPS, type LevelGroup } from "@/lib/view";
import { SearchBox, type FindProps } from "./search-box";

const GROUP_LABEL: Record<LevelGroup, string> = {
  error: "Errors",
  warn: "Warnings",
  info: "Info",
  debug: "Debug",
  other: "Other",
};

const GROUP_STOP: Record<LevelGroup, string> = {
  error: "error",
  warn: "warning",
  info: "info line",
  debug: "debug line",
  other: "line",
};

const STOP_TITLE: Record<LevelGroup, string> = {
  error: "Error",
  warn: "Warning",
  info: "Info line",
  debug: "Debug line",
  other: "Line",
};

export type CopyState = "idle" | "done" | "failed";

type FilterBarProps = {
  find: FindProps;
  levels: {
    on: Record<LevelGroup, boolean>;
    counts: Record<LevelGroup, number>;
    stops: Record<LevelGroup, number>;
    position: { group: LevelGroup; index: number } | null;
    onToggle: (group: LevelGroup) => void;
    onStep: (group: LevelGroup, direction: 1 | -1) => void;
  };
  summary: string;
  canReset: boolean;
  onReset: () => void;
  actions: {
    copyState: CopyState;
    onCopy: () => void;
    onQr: () => void;
    fullWidth: boolean;
    onToggleFullWidth: () => void;
    panelOpen: boolean;
    panelId: string;
    onTogglePanel: () => void;
  };
};

export function FilterBar({
  find,
  levels,
  summary,
  canReset,
  onReset,
  actions,
}: FilterBarProps) {
  return (
    <div className="toolbar">
      <div className="toolbar__row">
        <SearchBox find={find} />

        <div className="toolbar__actions">
          <button
            type="button"
            className="action action--copy"
            data-tip="Copy the whole log"
            onClick={actions.onCopy}
            data-state={actions.copyState}
          >
            {actions.copyState === "done" ? (
              <Check aria-hidden="true" />
            ) : actions.copyState === "failed" ? (
              <WarningCircle aria-hidden="true" />
            ) : (
              <Copy aria-hidden="true" />
            )}
            {actions.copyState === "done"
              ? "Copied"
              : actions.copyState === "failed"
                ? "Copy failed"
                : "Copy"}
          </button>
          <span className="show-for-sr" role="status">
            {actions.copyState === "done" ? "Copied to the clipboard." : ""}
          </span>
          <button
            type="button"
            className="action"
            data-tip="Show a QR code for this log"
            onClick={actions.onQr}
          >
            <QrCode aria-hidden="true" />
            QR code
          </button>
          <button
            type="button"
            className="action action--wide-toggle"
            aria-pressed={actions.fullWidth}
            data-tip={actions.fullWidth ? "Back to the normal width" : "Stretch to the whole window"}
            onClick={actions.onToggleFullWidth}
          >
            {actions.fullWidth ? (
              <ArrowsInLineHorizontal aria-hidden="true" />
            ) : (
              <ArrowsOutLineHorizontal aria-hidden="true" />
            )}
            Full width
          </button>
          <button
            type="button"
            className="action"
            aria-expanded={actions.panelOpen}
            data-tip={actions.panelOpen ? "Hide settings" : "Show settings"}
            aria-controls={actions.panelId}
            onClick={actions.onTogglePanel}
          >
            <SlidersHorizontal aria-hidden="true" />
            Settings
          </button>
        </div>
      </div>

      {find.invalid && (
        <p id="line-filter-error" className="toolbar__error" role="alert">
          That pattern isn&apos;t valid. Check the brackets and slashes.
        </p>
      )}

      <div className="toolbar__row">
        <div
          role="group"
          aria-label="Show lines by level"
          className="toolbar__levels"
        >
          {LEVEL_GROUPS.filter(
            (group) => levels.counts[group] > 0,
          ).map((group) => {
            const label = GROUP_LABEL[group];
            const active = levels.position?.group === group;
            const stops = levels.stops[group];

            return (
              <div
                key={group}
                className={`chip-split chip-split--${group}${active ? " is-active" : ""}`}
              >
                <button
                  type="button"
                  className={`chip chip--${group}`}
                  aria-pressed={levels.on[group]}
                  data-tip={`${levels.on[group] ? "Hide" : "Show"} ${label.toLowerCase()}`}
                  onClick={() => levels.onToggle(group)}
                >
                  {label}
                  <span className="chip__count">
                    {levels.counts[group].toLocaleString("en")}
                  </span>
                </button>
                <div
                  className="chip-split__nav"
                  role="group"
                  aria-label={`Jump through ${label.toLowerCase()}`}
                >
                  <button
                    type="button"
                    className="chip-split__step"
                    aria-label={`Previous ${GROUP_STOP[group]}`}
                    data-tip={`Previous ${GROUP_STOP[group]}`}
                    disabled={stops === 0}
                    onClick={() => levels.onStep(group, -1)}
                  >
                    <CaretUp aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="chip-split__step"
                    aria-label={`Next ${GROUP_STOP[group]}`}
                    data-tip={`Next ${GROUP_STOP[group]}`}
                    disabled={stops === 0}
                    onClick={() => levels.onStep(group, 1)}
                  >
                    <CaretDown aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <p className="toolbar__summary" aria-live="polite">
          {levels.position
            ? `${STOP_TITLE[levels.position.group]} ${(levels.position.index + 1).toLocaleString("en")} of ${levels.stops[levels.position.group].toLocaleString("en")}`
            : summary}
        </p>

        {canReset && (
          <button type="button" className="chip" onClick={onReset}>
            Reset filters
          </button>
        )}
      </div>
    </div>
  );
}

