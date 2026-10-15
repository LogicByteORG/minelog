"use client";

import { useState, useSyncExternalStore } from "react";
import { X } from "@phosphor-icons/react";
import { BUYMEACOFFEE_URL } from "@/lib/config";
import {
  dismissDonateNudge,
  donateDismissed,
  readSaveCount,
  shouldShowDonateNudge,
} from "@/lib/donate";
import { BrandIcon } from "./brand-icon";

function subscribeDonate(notify: () => void) {
  window.addEventListener("storage", notify);
  return () => window.removeEventListener("storage", notify);
}

function readDonateSnapshot(): boolean {
  return shouldShowDonateNudge(readSaveCount(), donateDismissed());
}

function readDonateServer(): boolean {
  return false;
}

export function DonateNudge() {
  const stored = useSyncExternalStore(
    subscribeDonate,
    readDonateSnapshot,
    readDonateServer,
  );
  const [gone, setGone] = useState(false);

  if (gone || !stored) return null;

  function dismiss() {
    dismissDonateNudge();
    setGone(true);
  }

  return (
    <div className="callout donate-nudge" role="status">
      <BrandIcon slug="buymeacoffee" size={16} />
      <span>
        minelog is free to use. If it&apos;s been handy,{" "}
        <a href={BUYMEACOFFEE_URL} target="_blank" rel="noopener noreferrer">
          a coffee
        </a>{" "}
        helps keep it running.
      </span>
      <button
        type="button"
        className="callout__close"
        aria-label="Dismiss"
        data-tip="Dismiss"
        onClick={dismiss}
      >
        <X aria-hidden="true" />
      </button>
    </div>
  );
}
