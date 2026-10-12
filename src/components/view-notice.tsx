"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { WarningCircle, X } from "@phosphor-icons/react";

const DISMISS_MS = 8000;

export function ViewNotice() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  const dropParam = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has("notice")) return;
    params.delete("notice");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setOpen(false);
      dropParam();
    }, DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [dropParam]);

  if (!open) return null;

  function dismiss() {
    setOpen(false);
    dropParam();
  }

  return (
    <div className="callout warning log-head__notice log-head__notice--single" role="status">
      <WarningCircle aria-hidden="true" />
      <span>
        Clean view is for README files only, so here is the full log instead.
      </span>
      <button
        type="button"
        className="callout__close"
        aria-label="Dismiss notice"
        data-tip="Dismiss"
        onClick={dismiss}
      >
        <X aria-hidden="true" />
      </button>
    </div>
  );
}
