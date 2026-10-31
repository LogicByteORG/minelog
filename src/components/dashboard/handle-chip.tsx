"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "@phosphor-icons/react";
import { copyText } from "@/lib/copy";

export function HandleChip({ handle }: { handle: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    if (!(await copyText(handle))) return;
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      className="dash-handle"
      data-tip={copied ? "Copied" : "Copy the handle your scripts use"}
      aria-label={`Copy the handle ${handle}`}
      onClick={() => void copy()}
    >
      {handle}
      {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
    </button>
  );
}
