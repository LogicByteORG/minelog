"use client";

export const GOTO_LINE_EVENT = "minelog:goto-line";

export function LineLink({
  line,
  onJump,
}: {
  line: number;
  onJump?: () => void;
}) {
  return (
    <button
      type="button"
      className="line-link"
      data-tip={`Jump to line ${line}`}
      onClick={() => {
        window.dispatchEvent(new CustomEvent<number>(GOTO_LINE_EVENT, { detail: line }));
        onJump?.();
      }}
    >
      line {line}
    </button>
  );
}

