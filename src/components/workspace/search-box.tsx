"use client";

import { useEffect, useRef, type KeyboardEvent } from "react";
import {
  CaretDown,
  CaretUp,
  Funnel,
  MagnifyingGlass,
  X,
} from "@phosphor-icons/react";

export type FindProps = {
  value: string;
  onChange: (value: string) => void;
  useRegex: boolean;
  onRegex: (value: boolean) => void;
  matchCase: boolean;
  onMatchCase: (value: boolean) => void;
  onlyMatches?: boolean;
  onOnlyMatches?: (value: boolean) => void;
  invalid: boolean;
  total: number;
  position: number | null;
  onStep: (direction: 1 | -1) => void;
};

export function SearchBox({
  find,
  label = "Find in log",
}: {
  find: FindProps;
  label?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const searching = find.value !== "";

  useEffect(() => {
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (
        !(event.ctrlKey || event.metaKey) ||
        event.key.toLowerCase() !== "f" ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }
      event.preventDefault();
      input.current?.focus({ preventScroll: true });
      input.current?.select();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const canStep = searching && !find.invalid && find.total > 0;

  const countText = !searching
    ? ""
    : find.invalid
      ? "Invalid"
      : find.total === 0
        ? "No matches"
        : find.position === null
          ? `${find.total.toLocaleString("en")} found`
          : `${(find.position + 1).toLocaleString("en")} / ${find.total.toLocaleString("en")}`;

  function onSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      if (canStep) find.onStep(event.shiftKey ? -1 : 1);
    } else if (event.key === "Escape" && searching) {
      event.preventDefault();
      find.onChange("");
    }
  }

  return (
    <div className={`search${searching ? " has-value" : ""}`}>
      <label htmlFor="line-filter" className="show-for-sr">
        {label}
      </label>
      <MagnifyingGlass aria-hidden="true" className="search__icon" />
      <input
        ref={input}
        id="line-filter"
        type="search"
        className="search__input"
        value={find.value}
        onChange={(event) => find.onChange(event.target.value)}
        onKeyDown={onSearchKeyDown}
        placeholder={label}
        autoComplete="off"
        spellCheck={false}
        aria-invalid={find.invalid}
        aria-describedby={find.invalid ? "line-filter-error" : undefined}
      />
      <div className="search__modes" role="group" aria-label="Search options">
        <button
          type="button"
          className="search__toggle"
          aria-pressed={find.matchCase}
          aria-label="Match case"
          data-tip="Match case"
          onClick={() => find.onMatchCase(!find.matchCase)}
        >
          <span aria-hidden="true">Aa</span>
        </button>
        <button
          type="button"
          className="search__toggle"
          aria-pressed={find.useRegex}
          aria-label="Regular expression"
          data-tip="Regular expression"
          onClick={() => find.onRegex(!find.useRegex)}
        >
          <span aria-hidden="true">.*</span>
        </button>
        {find.onOnlyMatches && (
          <button
            type="button"
            className="search__toggle"
            aria-pressed={find.onlyMatches}
            aria-label="Only show matching lines"
            data-tip="Only show matching lines"
            onClick={() => find.onOnlyMatches?.(!find.onlyMatches)}
          >
            <Funnel aria-hidden="true" />
          </button>
        )}
      </div>
      <div className="search__tools">
        <span className="search__count" aria-live="polite">
          {countText}
        </span>
        <button
          type="button"
          className="search__tool"
          aria-label="Previous match"
          data-tip="Previous match (Shift+Enter)"
          disabled={!canStep}
          onClick={() => find.onStep(-1)}
        >
          <CaretUp aria-hidden="true" />
        </button>
        <button
          type="button"
          className="search__tool"
          aria-label="Next match"
          data-tip="Next match (Enter)"
          disabled={!canStep}
          onClick={() => find.onStep(1)}
        >
          <CaretDown aria-hidden="true" />
        </button>
        {searching && (
          <button
            type="button"
            className="search__tool"
            aria-label="Clear search"
            data-tip="Clear search (Esc)"
            onClick={() => {
              find.onChange("");
              input.current?.focus();
            }}
          >
            <X aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}

