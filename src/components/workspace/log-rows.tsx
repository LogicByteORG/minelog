"use client";

import {
  Fragment,
  memo,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { CaretDown, CaretRight } from "@phosphor-icons/react";
import {
  overlayMatches,
  splitMatches,
  stripTimestamp,
  type Row,
  type ViewLine,
} from "@/lib/view";
import { LINE_CLASS } from "../log-view";

const INTRO_ROWS = 40;
const FOLD_STEPS = 12;

type LogRowsProps = {
  rows: Row[];
  highlight: RegExp | null;
  timestamps: boolean;
  expanded: Set<number>;
  onToggleFold: (key: number) => void;
  marked: Set<number>;
  onToggleMark: (n: number) => void;
  onMarkPointerDown: (n: number, event: ReactPointerEvent<HTMLButtonElement>) => void;
  onMarkPointerEnter: (n: number, event: ReactPointerEvent<HTMLButtonElement>) => void;
  intro: boolean;
  currentN?: number;
};

export function LogRows({
  rows,
  highlight,
  timestamps,
  expanded,
  onToggleFold,
  marked,
  onToggleMark,
  onMarkPointerDown,
  onMarkPointerEnter,
  intro,
  currentN,
}: LogRowsProps) {
  return (
    <ol className="log__list">
      {rows.map((row, index) => {
        if (row.kind === "line") {
          return (
            <MemoLineRow
              key={row.line.n}
              line={row.line}
              highlight={highlight}
              timestamps={timestamps}
              marked={marked.has(row.line.n)}
              onToggleMark={onToggleMark}
              onMarkPointerDown={onMarkPointerDown}
              onMarkPointerEnter={onMarkPointerEnter}
              current={row.line.n === currentN}
              step={intro && index < INTRO_ROWS ? index : undefined}
            />
          );
        }

        return (
          <FoldRows
            key={`fold-${row.key}`}
            open={expanded.has(row.key)}
            lines={row.lines}
            highlight={highlight}
            timestamps={timestamps}
            marked={marked}
            onToggleMark={onToggleMark}
            onMarkPointerDown={onMarkPointerDown}
            onMarkPointerEnter={onMarkPointerEnter}
            currentN={currentN}
            onToggle={() => onToggleFold(row.key)}
            step={intro && index < INTRO_ROWS ? index : undefined}
          />
        );
      })}
    </ol>
  );
}

function LineRow({
  line,
  highlight,
  timestamps,
  marked,
  onToggleMark,
  onMarkPointerDown,
  onMarkPointerEnter,
  current,
  step,
}: {
  line: ViewLine;
  highlight: RegExp | null;
  timestamps: boolean;
  marked: boolean;
  onToggleMark: (n: number) => void;
  onMarkPointerDown: (n: number, event: ReactPointerEvent<HTMLButtonElement>) => void;
  onMarkPointerEnter: (n: number, event: ReactPointerEvent<HTMLButtonElement>) => void;
  current: boolean;
  step?: number;
}) {
  const shown =
    timestamps || line.tokens ? line.text : stripTimestamp(line.text);
  const pieces = line.tokens ? [] : splitMatches(shown, highlight);
  const colored = line.tokens ? overlayMatches(line.tokens, highlight) : null;
  const classes = [
    "log__line",
    LINE_CLASS[line.level],
    step === undefined ? "" : "log__line--enter",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <li
      className={classes}
      data-line={line.n}
      data-current={current || undefined}
      data-marked={marked || undefined}
      style={step === undefined ? undefined : ({ "--i": step } as CSSProperties)}
    >
      <button
        type="button"
        className="log__num"
        aria-pressed={marked}
        aria-label={marked ? `Unmark line ${line.n}` : `Mark line ${line.n}`}
        data-tip={marked ? "Marked" : "Mark this line"}
        tabIndex={-1}
        onClick={() => onToggleMark(line.n)}
        onPointerDown={(event) => onMarkPointerDown(line.n, event)}
        onPointerEnter={(event) => onMarkPointerEnter(line.n, event)}
      >
        {line.n}
      </button>
      <span className="log__text">
        {shown === ""
          ? " "
          : colored
            ? colored.map((piece, index) => {
                const inner = piece.match ? (
                  <mark>{piece.text}</mark>
                ) : (
                  piece.text
                );
                return piece.kind === "plain" ? (
                  <Fragment key={index}>{inner}</Fragment>
                ) : (
                  <span key={index} className={`tok tok--${piece.kind}`}>
                    {inner}
                  </span>
                );
              })
            : pieces.map((piece, index) =>
              piece.match ? (
                <mark key={index}>{piece.text}</mark>
              ) : (
                piece.text
              ),
            )}
      </span>
    </li>
  );
}

const MemoLineRow = memo(LineRow);

function FoldRows({
  open,
  lines,
  highlight,
  timestamps,
  marked,
  onToggleMark,
  onMarkPointerDown,
  onMarkPointerEnter,
  currentN,
  onToggle,
  step,
}: {
  open: boolean;
  lines: ViewLine[];
  highlight: RegExp | null;
  timestamps: boolean;
  marked: Set<number>;
  onToggleMark: (n: number) => void;
  onMarkPointerDown: (n: number, event: ReactPointerEvent<HTMLButtonElement>) => void;
  onMarkPointerEnter: (n: number, event: ReactPointerEvent<HTMLButtonElement>) => void;
  currentN?: number;
  onToggle: () => void;
  step?: number;
}) {
  const count = lines.length;

  return (
    <>
      <li
        className={`log__fold-row${step === undefined ? "" : " log__line--enter"}`}
        style={step === undefined ? undefined : ({ "--i": step } as CSSProperties)}
      >
        <button
          type="button"
          className="log__fold"
          aria-expanded={open}
          onClick={onToggle}
        >
          {open ? (
            <CaretDown aria-hidden="true" />
          ) : (
            <CaretRight aria-hidden="true" />
          )}
          {open ? `Hide ${count} stack lines` : `Show ${count} stack lines`}
        </button>
      </li>
      {open &&
        lines.map((line, index) => (
          <MemoLineRow
            key={line.n}
            line={line}
            highlight={highlight}
            timestamps={timestamps}
            marked={marked.has(line.n)}
            onToggleMark={onToggleMark}
            onMarkPointerDown={onMarkPointerDown}
            onMarkPointerEnter={onMarkPointerEnter}
            current={line.n === currentN}
            step={Math.min(index, FOLD_STEPS)}
          />
        ))}
    </>
  );
}

