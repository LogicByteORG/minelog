"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  PAGE_FEATURES,
  PAGE_NAME_MAX,
  RADIUS_MAX,
  pageCss,
  readTheme,
  type LogoSources,
  type PageFeature,
  type PageTheme,
} from "@/lib/page-settings";
import { BrandFooter, BrandHeader } from "./brand-chrome";

export type BrandState = {
  theme: PageTheme;
  radius: number;
  name: string | null;
  logo: LogoSources;
  off: PageFeature[];
};

// The editor shows the real page in a frame and sends it the draft with `postMessage`.
// Everything that arrives is checked again here, the page never trusts the message.
const FEATURE_KEYS = new Set<string>(
  PAGE_FEATURES.map((feature) => feature.key),
);
const isImage = (value: unknown): value is string =>
  typeof value === "string" &&
  /^(blob:|https?:\/\/|\/)/.test(value) &&
  value.length < 2000;

function readDraft(data: unknown, current: BrandState): BrandState | null {
  if (!data || typeof data !== "object") return null;
  const draft = data as Record<string, unknown>;
  if (draft.type !== "brand-draft") return null;

  const radius = Number(draft.radius);
  const logo = draft.logo as { light?: unknown; dark?: unknown } | null;
  return {
    theme: readTheme(draft.theme),
    radius:
      Number.isInteger(radius) && radius >= 0 && radius <= RADIUS_MAX
        ? radius
        : current.radius,
    name:
      typeof draft.name === "string" && draft.name.trim()
        ? draft.name.trim().slice(0, PAGE_NAME_MAX)
        : null,
    logo:
      logo && isImage(logo.light) && isImage(logo.dark)
        ? { light: logo.light, dark: logo.dark }
        : null,
    off: Array.isArray(draft.off)
      ? draft.off.filter(
          (key): key is PageFeature =>
            typeof key === "string" && FEATURE_KEYS.has(key),
        )
      : [],
  };
}

export function LiveBrand({
  initial,
  href,
  children,
}: {
  initial: BrandState;
  href: string | null;
  children: ReactNode;
}) {
  const [state, setState] = useState(initial);

  useEffect(() => {
    // Only a page inside the editor's frame listens, and only to the editor itself.
    if (window.parent === window) return;
    const onMessage = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== window.parent
      )
        return;
      setState((current) => readDraft(event.data, current) ?? current);
    };
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: "brand-ready" }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <div className="brand-page" data-off={state.off.join(" ")}>
      {/* Built only from checked hex colors and small numbers, see `pageCss`. */}
      <style
        dangerouslySetInnerHTML={{ __html: pageCss(state.theme, state.radius) }}
      />
      <BrandHeader
        name={state.name}
        showName={state.theme.showName}
        logo={state.logo}
        href={href}
      />
      <div className="brand-page__body">{children}</div>
      <BrandFooter />
    </div>
  );
}
