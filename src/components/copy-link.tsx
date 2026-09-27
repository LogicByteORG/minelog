"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "@phosphor-icons/react";
import { copyText } from "@/lib/copy";

type CopyLinkProps = {
  url: string;
  block?: boolean;
};

export function CopyLink({ url, block = false }: CopyLinkProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const urlBox = useRef<HTMLElement>(null);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    if (await copyText(url)) {
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2000);
    } else {
      const range = document.createRange();
      range.selectNodeContents(urlBox.current as Node);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }

  return (
    <div
      className={`share-link${block ? " share-link--block" : ""}`}
      onClick={() => void copy()}
      data-tip={copied ? "Copied" : "Copy link"}
    >
      <code ref={urlBox} className="share-link__url">
        {url}
      </code>
      <button
        type="button"
        className="share-link__copy"
        aria-label={copied ? "Link copied" : "Copy link"}
        data-copied={copied}
      >
        {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      </button>
      <span className="show-for-sr" role="status">
        {copied ? "Link copied to the clipboard." : ""}
      </span>
    </div>
  );
}

