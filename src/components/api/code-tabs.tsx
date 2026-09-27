"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "@phosphor-icons/react";
import { copyText } from "@/lib/copy";
import { Segmented } from "../workspace/segmented";

type Sample = { id: string; label: string; code: string };

type CodeTabsProps = {
  label: string;
  samples: Sample[];
  caption?: string;
};

export function CodeTabs({ label, samples, caption }: CodeTabsProps) {
  const [active, setActive] = useState(samples[0].id);
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const sample = samples.find((item) => item.id === active) ?? samples[0];

  async function copy() {
    if (!(await copyText(sample.code))) return;
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <figure className="api-code" aria-label={label}>
      <div className="api-code__bar">
        {samples.length > 1 ? (
          <Segmented
            label={`${label}: language`}
            options={samples.map(({ id, label: text }) => ({ value: id, label: text }))}
            value={sample.id}
            onChange={(next) => {
              setActive(next);
              setCopied(false);
            }}
          />
        ) : (
          <span className="api-code__caption">{caption ?? sample.label}</span>
        )}
        <button
          type="button"
          className="api-code__copy"
          data-tip={copied ? "Copied" : "Copy the example"}
          aria-label={copied ? "Example copied" : "Copy the example"}
          onClick={() => void copy()}
        >
          {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
        </button>
      </div>
      <pre className="api-code__pre scroll-quiet" tabIndex={0}>
        <code>{sample.code}</code>
      </pre>
      <span className="show-for-sr" role="status">
        {copied ? "Example copied to the clipboard." : ""}
      </span>
    </figure>
  );
}

