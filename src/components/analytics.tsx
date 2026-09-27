"use client";

import { useEffect, useState } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";
import { GA_MEASUREMENT_ID } from "@/lib/config";

const PUBLIC_PATH = /^\/(?:$|guides(?:\/[^/]+)?\/?$|api\/?$|privacy\/?$)/;

let guarded = false;

function isPublic(pathname: string): boolean {
  return PUBLIC_PATH.test(pathname);
}

function setDisabled(disabled: boolean) {
  (window as unknown as Record<string, boolean>)[
    `ga-disable-${GA_MEASUREMENT_ID}`
  ] = disabled;
}

function guardAddressChanges() {
  if (guarded) return;
  guarded = true;

  const apply = (url?: string | URL | null) => {
    const path = url ? new URL(String(url), window.location.href).pathname : window.location.pathname;
    setDisabled(!isPublic(path));
  };

  for (const method of ["pushState", "replaceState"] as const) {
    const original = window.history[method];
    window.history[method] = function (this: History, data, unused, url) {
      apply(url);
      return original.call(this, data, unused, url);
    };
  }
  window.addEventListener("popstate", () => apply());
  apply();
}

export function Analytics() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    guardAddressChanges();

    if (process.env.NODE_ENV !== "production") return;

    let cancelled = false;
    fetch("/api/region", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((answer) => {
        if (!cancelled && answer?.analytics === true) setAllowed(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return allowed ? <GoogleAnalytics gaId={GA_MEASUREMENT_ID} /> : null;
}

