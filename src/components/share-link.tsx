"use client";

import { useSyncExternalStore } from "react";
import { MARKS_EVENT } from "@/lib/view";
import { CopyLink } from "./copy-link";

export function ShareLink() {
  const href = useSyncExternalStore(
    (notify) => {
      window.addEventListener("popstate", notify);
      window.addEventListener(MARKS_EVENT, notify);
      return () => {
        window.removeEventListener("popstate", notify);
        window.removeEventListener(MARKS_EVENT, notify);
      };
    },
    () => window.location.href,
    () => "",
  );

  if (!href) return null;
  return <CopyLink url={href} />;
}

