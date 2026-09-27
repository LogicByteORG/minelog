import type { CSSProperties } from "react";
import { levelOf, type LineLevel } from "@/lib/log";

export const LINE_CLASS: Record<LineLevel, string> = {
  info: "",
  plain: "",
  debug: "log__line--debug",
  warn: "log__line--warn",
  error: "log__line--error",
  stack: "log__line--stack",
};

type LogViewProps = {
  text: string;
  limit: number;
  label: string;
  animate?: boolean;
};

const ENTER_LINES = 40;

export function LogView({ text, limit, label, animate = false }: LogViewProps) {
  const lines = text.split(/\r?\n/);
  const shown = lines.slice(0, limit);
  const hidden = lines.length - shown.length;

  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      className="log scroll-quiet"
    >
      <ol className="log__list">
        {shown.map((line, index) => (
          <li
            key={index}
            className={[
              "log__line",
              LINE_CLASS[levelOf(line)],
              animate && index < ENTER_LINES ? "log__line--enter" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={{ "--i": index } as CSSProperties}
          >
            <span aria-hidden="true" className="log__num">
              {index + 1}
            </span>
            <span className="log__text">{line || " "}</span>
          </li>
        ))}
      </ol>
      {hidden > 0 && (
        <p className="log__more">
          Showing the first {limit.toLocaleString("en")} lines. The other{" "}
          {hidden.toLocaleString("en")} are saved with your log.
        </p>
      )}
    </div>
  );
}

